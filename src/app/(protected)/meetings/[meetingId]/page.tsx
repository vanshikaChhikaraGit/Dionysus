import React from 'react'
import IssuesList from './Issues-List'

type Props = {
    params: Promise<{ meetingId:string }>
}

const MeetingDetails = async({ params }: Props) => {
    const { meetingId } = await params

  return (
  <IssuesList meetingId={meetingId}></IssuesList>
  )
}

export default MeetingDetails