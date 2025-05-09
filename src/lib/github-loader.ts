import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { generateSummary, generateSummaryEmbedding } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

//step0: check credits that user will require for the github repo that they are uploading

const getFileCount = async(path:string,octokit:Octokit,githubOwner:string,githubRepo:string,acc:number=0)=>{
  const { data } = await octokit.rest.repos.getContent({
    owner:githubOwner,
    repo:githubRepo,
    path
  })
  //if the current data is a single file
  if(!Array.isArray(data)&&data.type==='file'){
    return acc+1;
  }
  //if current data an array of file or distributed through nested directories then traverse throught it
  if(Array.isArray(data)){
    let fileCount = 0;
    const directories: string[] = []

    for(const item of data){
          if(item.type==='dir'){
            directories.push(item.path)
          }else{
            fileCount++
          }
    }

    if(directories.length>0){
      const directoryCounts = await Promise.all(
        directories.map(dirPath=>getFileCount(dirPath,octokit,githubOwner,githubRepo,0))
      )
      fileCount += directoryCounts.reduce((acc,count)=>acc+count,0)
    }
    return acc+ fileCount
  }
  console.log(acc)
  return acc
}

export const checkUserCredits = async (githubUrl:string, githubToken?:string)=>{
  //find how many files are in repo
  const octokit = new Octokit({ auth:githubToken })
  const githubOwner = githubUrl?.split('/')[3]
  const githubRepo = githubUrl.split('/')[4]
console.log(githubOwner)
console.log(githubRepo)
  if(!githubOwner||!githubRepo){
    return 0;
  }

  const fileCount = await getFileCount('',octokit,githubOwner,githubRepo,0)
  console.log(fileCount)
  return fileCount
}

//step1:- load the github repository and its files and their contents
//step2:- summarise the page contents and generate embeddings using gemini ai
//step3:- save the embeddings in the database using raw query (because currently postgres doesnt support orm queries to store vector embeddings)

//step1:-
export const loadGitHubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken ?? "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "bun.lockb",
      "yarn.lock",
      "pnpm-lock.yaml",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async(projectId:string,githubUrl:string,githubToken?:string)=>{
const docs = await loadGitHubRepo(githubUrl,githubToken)
const allEmbeddings = await generateEmbeddings(docs)
await Promise.allSettled(allEmbeddings.map(async (embedding,index)=>{
    if(!embedding)return 

    const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data:{
            fileName:embedding.fileName,
            sourceCode:embedding.sourceCode,
            summary:embedding.summary,
            projectId:projectId
        }
    })

    await db.$executeRaw`
    UPDATE "SourceCodeEmbedding"
    SET "summaryEmbedding" = ${embedding.embedding}::vector
    WHERE "id" = ${sourceCodeEmbedding.id}
    `
}))
}

//step2
const generateEmbeddings = async(docs:Document[])=>{
    return Promise.all(docs.map( async doc=>{
        const summary = await generateSummary(doc)
        const embedding = await generateSummaryEmbedding(summary)
        return {    
            summary,
            embedding,
            sourceCode:JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source
        }
    }))
}
