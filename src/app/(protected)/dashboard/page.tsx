"use client"

import useProject from '@/hooks/use-project'
import { useUser } from '@clerk/nextjs'
import { ExternalLink, Github, Link2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  const { project } = useProject()
  return (
    <div>
    <div className='flex items-center justify-between flex-wrap gap-y-4'>
      {/* github url of current active project  */}
      <div className='w-fit rounded-md bg-primary text-white px-4 py-3'>
        <div className='flex items-center flex-wrap'>
          <Github className='text-white size-5'/>
          <div className="ml-2 break-words">
          <p>This project is linked to {` `}
          <Link href={project?.githubUrl??""} className='inline-flex items-center text-white/80 hover:underline break-all'>
          {project?.githubUrl}
          <ExternalLink className='ml-1 size-4'/>
          </Link>
          </p>
          </div>
          
        </div>
      </div>
      <div className="h-4 sm:h-0"></div>
      <div className="flex items-center gap-4 shrink-0" >
        tema memebers 
        invite button 
        archive button
      </div>
    </div>

    <div className="mt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        ask question card
        meeting card
      </div>
    </div>

    <div className="mt-8">
      commit log
    </div>
  </div>
  
  )
}

export default Page