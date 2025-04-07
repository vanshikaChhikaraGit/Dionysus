"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'
import {  useForm } from 'react-hook-form'

type FormInput = {
    repoUrl:string,
    projectName:string,
    githubToken?:string
}

const Page = () => {
const { register,handleSubmit,reset } = useForm<FormInput>()
function onSubmit(data:FormInput){
    window.alert(JSON.stringify(data,null,2))
    return true
}
  return (
    <div className='flex items-center gap-12 h-full justify-center'>
        <img src='/undraw_github.svg' className='h-66 w-auto'></img>
        <div>
            <div>
                <h1 className='font-semibold text-2xl'>
                    Link your GitHub Repository
                </h1>
                <p className='text-sm text-muted-foreground'>
                    exter the URL of your repository to link to Dionysus
                </p>
            </div>
            <div className="h-4"></div>
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                     <Input
                     {...register('projectName',{ required:true })}
                     placeholder='Project Name'
                     required></Input>
                     <div className="h-2"></div>
                     <Input 
                     type='url'
                     {...register('repoUrl',{required:true})}
                     placeholder='GitHub Repository URL'
                     required/>
                     <div className="h-2"></div>
                     <Input 
                     {...register('githubToken',{required:true})}
                     placeholder='GitHub Token (optional)'
                     required/>
<div className="h-4"></div>
<Button type={'submit'} className='hover:cursor-pointer'>
    Create Project
</Button>


                </form>
            </div>
        </div>
    </div>
  )
}

export default Page