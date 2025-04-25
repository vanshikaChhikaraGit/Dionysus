import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from 'axios'
import { generateCommitSummary } from "./gemini";
import { error } from "console";


const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitsList = async (github: string): Promise<Response[]> => {
  const [ owner,repo ] = github.split('/').slice(-2)
  const filterRepo = repo?.split('.')[0]
  if(!owner||!repo||!filterRepo){
    throw new Error('Invalid Github Url')
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner: owner,
    repo: filterRepo
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];
  return sortedCommits.slice(0, 10).map((commit) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};
export const pollCommits = async (projectId: string) => {
  try {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitsList(githubUrl);
    const unprocessedCommits = await getUnprocessedCommits(projectId, commitHashes);

    if (unprocessedCommits.length === 0) {
      return { count: 0, message: "No new commits to process" };
    }

    const summaryResponses = await Promise.allSettled(
      unprocessedCommits.map(commit => 
        summariseCommit(commit.commitHash, githubUrl)
      )
    );

    // Filter out failed summaries and log them
    const validSummaries: { summary: string; index: number }[] = [];
    const failedCommits: { commitHash: string; reason: unknown }[] = [];

    summaryResponses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        validSummaries.push({
          summary: response.value,
          index
        });
      } else {
        failedCommits.push({
          commitHash: unprocessedCommits[index]!.commitHash,
          reason: response.reason
        });
        console.error(`Failed to summarize commit ${unprocessedCommits[index]!.commitHash}:`, response.reason);
      }
    });

    if (validSummaries.length === 0) {
      throw new Error("Could not generate any commit summaries");
    }

    // Only process commits with successful summaries
    const commits = await db.commit.createMany({
      data: validSummaries.map(({ summary, index }) => ({
        projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary
      }))
    });

    return {
      ...commits,
      failedCount: failedCommits.length,
      failedCommits
    };

  } catch (error) {
    console.error("Error in pollCommits:", error);
    throw new Error(`Failed to poll commits: ${error instanceof Error ? error.message : String(error)}`);
  }
};
// export const pollCommits = async (projectId: string) => {
//   const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

//   const commitHashes = await getCommitsList(githubUrl)
 
//   const unprocessedCommits = await getUnprocessedCommits(projectId,commitHashes)

//   const summaryResponses = await Promise.allSettled (unprocessedCommits.map(commit=>{
//     return summariseCommit(commit.commitHash,githubUrl)
//   }))

//   const summaries = summaryResponses.map((summary)=>{
//   if(summary.status==='fulfilled'){
//     console.log(summary.value as string)
//     return summary.value as string
//   }else{
//     console.error(error)
//     throw new Error("couldnt generate summary")
//   }
//   }) 

//   const commits = await db.commit.createMany({
//    data: summaries.map((summary,index)=>{
//     console.log('processing commit',index)
//     return {
//     projectId,
//     commitHash:unprocessedCommits[index]!.commitHash,
//     commitMessage:unprocessedCommits[index]!.commitMessage,
//     commitAuthorAvatar:unprocessedCommits[index]!.commitAuthorAvatar,
//     commitAuthorName:unprocessedCommits[index]!.commitAuthorName,
//     commitDate:unprocessedCommits[index]!.commitDate,
//     summary
//   }
//    })
//   })

//   return commits


// };

const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }
  return { project, githubUrl: project.githubUrl };
};

const getUnprocessedCommits = async(projectId:string,commitHashes:Response[])=>{
    const processedCommits = await db.commit.findMany({
        where:{
            projectId:projectId
        }
    })
    const filterCommits = commitHashes.filter((commit)=>!processedCommits.some((processedCommit)=>processedCommit.commitHash===commit.commitHash))

    return filterCommits;
}

const summariseCommit = async(commitHash:string, githubUrl:string)=>{
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
    headers:{
      Accept:'application/vnd.github.v3.diff'
    }
  })
  return await generateCommitSummary(data)??"no summary generated"
}


