'use server'

import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateSummaryEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google = createGoogleGenerativeAI({
    apiKey:process.env.GEMINI_API_KEY
})

export const askQuestion = async(question:string,projectId:string)=>{
      //1. we will generate vector embedding of question
      const stream = createStreamableValue()
   
        const queryVector = await generateSummaryEmbedding(question)
        const vectorQuery = `[${queryVector.join(',')}]`
    
        //2. get the similarity score between summary embedding and question embedding
        //top 10 files with closest score will set up the context for ai
    
        const result = await db.$queryRaw`
        SELECT "fileName","sourceCode","summary",
        1-("summaryEmbedding"<=>${vectorQuery}::vector) AS similarity
        FROM "SourceCodeEmbedding"
        WHERE 1-("summaryEmbedding"<=>${vectorQuery}::vector)>.5
        AND "projectId"=${projectId}
        ORDER BY similarity DESC
        LIMIT 10
        `as { fileName:string; sourceCode:string;summary:string }[]

    //3. create the context
    let context = ''  
    for(const doc of result){
    context+= `source:${doc.fileName}\ncode content: ${doc.sourceCode}\n  summary of file: ${doc.summary}\n\n`
    
    }  
    
    //4. prompt the ai model
    (async () => { 
        const { textStream } = await streamText({
            model:google('gemini-1.5-flash'),
            prompt:`You are an AI code assistant who is a brand new, powerful, human-like artificial intelligence.
You answer questions about the codebase of any GitHub repository.
Your target audience is a technical intern who is in their learning phase and wants to contribute to the repo but is unable to clearly navigate and understand the GitHub repository.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
If the question is asking about code or a specific file, AI will provide a detailed answer, giving step-by-step instructions, including code snippets.

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question."
AI assistant will not apologize for previous responses, but instead will indicate that new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
AI assistant will not hallucinate or provide false information or an out-of-context answer.

Answer in **MARKDOWN SYNTAX**, with code snippets if needed. Use proper headings, bullet points, and fenced code blocks (\`\`\`) to improve readability.
Be as detailed as possible when answering user queries and always try to make the user completely understand the situation.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START OF QUESTION
${question}
END OF QUESTION
`
        });
    //stream the prompt and return the response
        for await(const delta of textStream ){
         
            stream.update(delta)
        }
        stream.done()
    })()
    return {
        output:stream.value,
        fileReferences:result
    }
   

}

