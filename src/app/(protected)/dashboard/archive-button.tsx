'use client'

import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner'

type Props = {}

const ArchiveButton = (props: Props) => {
    const archiveProject = api.project.archiveProject.useMutation()
    const { projectId } = useProject()
    const refetch = useRefetch()
  return (
    <div>
        <Button variant={'destructive'} className='hover:cursor-pointer' onClick={()=>{
          const confirm=  window.confirm("Are you sure you want to archive this project?")
          if(confirm){
            archiveProject.mutate({projectId},{onSuccess:()=>{toast.success("Project Archived successfully!"); refetch()},onError:()=>{toast.error("Couldn't archive project :(")}})
          }
        }}>Archive</Button>
    </div>
  )
}

export default ArchiveButton