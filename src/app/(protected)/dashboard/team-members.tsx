import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'

type Props = {}

const TeamMembers = (props: Props) => {
    const { projectId } = useProject()
    const { data : members } = api.project.getTeamMembers.useQuery({ projectId })
  return (
    <div className='flex items-center gap-2'>
        {members?.map(member=>(
            <img key={member.id} src={member.user.imageUrl || ''} alt='user logo' height={30} width={30} className='rounded-full border-2 border-green-500 p-0.15'></img>
        ))}

    </div>
  )
}

export default TeamMembers