import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import type { Document } from "@langchain/core/documents";
import { generateSummary, generateSummaryEmbedding } from "./gemini";
import { db } from "@/server/db";


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
