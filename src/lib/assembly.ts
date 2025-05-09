import {AssemblyAI} from 'assemblyai'
import "dotenv/config";

const apiKey = process.env.ASSEMBLY_API_KEY
if(!apiKey)throw new Error("no api key found")
const client = new AssemblyAI({apiKey:apiKey})

function msToTime(ms:number){
    const seconds = ms/1000;
    const minutes = Math.floor(seconds/60)
    const remainingSeconds = Math.floor(seconds%60)

    return `${minutes.toString().padStart(2,'0')}:${remainingSeconds.toString().padStart(2,'0')}`

}

export const processMeeting = async (meetingUrl:string)=>{
const transcript = await client.transcripts.transcribe({
    audio:meetingUrl,
    auto_chapters:true
})

const summaries = transcript.chapters?.map(chapter=>({
    start:msToTime(chapter.start),
    end:msToTime(chapter.end),
    gist:chapter.gist,
    headline:chapter.headline,
    summary:chapter.summary
})) || []

if(!transcript.text)throw new Error("No transcript found")
return {
    summaries
}
}

// const FLIE_URL = 'https://assembly.ai/sports_injuries.mp3'

// const responses = await processMeeting(FLIE_URL)

// console.log(responses)