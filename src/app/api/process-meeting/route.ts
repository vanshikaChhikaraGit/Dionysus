import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
    meetingUrl:z.string(),
    meetingId:z.string(),
    projectId:z.string()
})

export async function POST(req:NextRequest){
    const { userId } = await auth()
    if(!userId){
       NextResponse.json({status:401, message:"Unauthorized"})
    }

    try {
        const body = await req.json()
        const { meetingUrl,meetingId,projectId } = bodyParser.parse(body)

        const { summaries } = await processMeeting(meetingUrl)

        await db.issue.createMany({
            data: summaries.map((summary)=>({
                start:summary.start,
                end : summary.end,
                headline : summary.headline,
                summary: summary.summary,
                gist : summary.gist,
                meetingId
            }))
        })

        await db.meeting.update({
            where:{
                id:meetingId
            },
            data:{
                status:'COMPLETED',
                name: summaries[0]?.headline
            }
        })

        return NextResponse.json({status:200,success:true})
    } catch (error) {
        console.log('errro in processing meeting api endpoint',error)
        return NextResponse.json({status:500,success:false})
    }
} 