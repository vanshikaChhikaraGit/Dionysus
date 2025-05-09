'use client'
import dynamic from 'next/dynamic'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
// const MeetingCard = dynamic(() => import('../dashboard/meeting-card'), {
//     ssr: false,
//     loading: () => <div>Loading...</div>
//   });
import MeetingCard from '../dashboard/meeting-card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

type Props = {}

const MeetingPage = (props: Props) => {
    const { projectId } = useProject()
    const refetch  = useRefetch()
    const { data:meetings, isLoading } = api.project.getMeetings.useQuery({projectId})
    const deleteMeeting = api.project.deleteMeeting.useMutation()
  return (
    <div>
        <MeetingCard />
        <h1 className='text-xl font-semibold'>Meetings</h1>
        {meetings && meetings.length==0 && <div>No Meetings Found</div>}
        {isLoading && <div>Loading </div>}
        <ul className='divide-y divide-gray-200'>
            {meetings?.map(meeting =>(
                <li key={meeting.id} className='flex items-center justify-between py-6 gap-x-6'>
                    <div>
                        <div className='min-w-0'>
                            <div className="flex items-center gap-2">
                                <Link href={`/meetings/${meeting.id}`} className='text-sm font-semibold'>
                                {meeting.name}
                                </Link>
                                {meeting.status==='PROCESSING' && (
                                    <Badge className='bg-yellow-400 text-white'>
                                        Processing 
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center text-xs text-gray-500 gap-x-2">
                            <p className='whitespace-nowrap'>
                                {meeting.createdAt.toLocaleDateString()}
                            </p>
                            <p className='truncate'>{meeting.issues.length} issues</p>
                        </div>
                    </div>
                    <div className='flex items-center flex-none gap-x-4'>
                        <Link href={`/meetings/${meeting.id}`}>
                        <Button variant={'outline'}>
                            View Meeting
                        </Button>
                        </Link>
                        <Button disabled={deleteMeeting.isPending} variant={'destructive'} 
                        onClick={()=>deleteMeeting.mutate({meetingId:meeting.id},
                        {onSuccess: ()=>{toast.success("Meeting uploaded successfully."), refetch()},
                        onError:()=>toast.success("Failed to delete meeting.")})}>
                            Delete Meeting
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    </div>
  )
}

export default MeetingPage;