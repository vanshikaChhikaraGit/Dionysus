"use client"
import useProject from '@/hooks/use-project'
import { cn } from '@/lib/utils'
import { api } from '@/trpc/react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CommitLog = () => {
    const { projectId,project } = useProject()
    const { data:commits } = api.project.getCommits.useQuery({projectId:projectId})
  return (
    <>
    <ul className='space-y-6'>
        {commits?.map((commit,commitIdx)=>{
            return <li key={commit.id} className='relative flex gap-x-4'>
                <div className={cn(
                    commitIdx===commits.length-1?'h-6':'-bottom-6',
                   'absolute left-0 top-0 flex justify-center w-6 '
                )}>
                    <div className='w-px translate-x-1 bg-gray-200'></div>
                </div>

                <>
                <img src={commit.commitAuthorAvatar} alt='commit avatar' className='relative mt-4 size-8 flex-none rounded-full bg-gray-50 border-primary border-2 -translate-y-1'></img>
                <div className='flex-auto rounded-md bg-white ring-1 ring-inset ring-gray-200 p-3 '>
                    <div className='flex gap-x-4 justify-between'>
                        <Link target='_blank' href={`${project?.githubUrl}/commit/${commit.commitHash}`} className='py-0.5 text-xs leading-5 text-gray-500 '>
                        <span className='font-medium text-gray-900'>
                            {commit.commitAuthorName}
                        </span>{" "}
                        <span className='inline-flex items-center'>committed <ExternalLink className='ml-1 leading-0' size={13}></ExternalLink></span>
                        </Link>
                    </div>
                <div>
                    <span className='font-semibold'>
                        {commit.commitMessage}
                    </span>
                    <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                        {commit.summary}
                    </pre>
                </div>
                </div>
                </>
            </li>
        })}
    </ul>
    </>
  )
}

export default CommitLog