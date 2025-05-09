'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeRefrences from '../dashboard/code-refrences'


const QAPage = () => {
    const { projectId } = useProject()
    const { data:questions } =  api.project.getQuestions.useQuery({ projectId })
    const [ questionIndex,setQuestionIndex ] = React.useState(0)
    const question = questions?.[questionIndex]

    console.log(questions)
  return (
   <Sheet>
    <AskQuestionCard></AskQuestionCard>
    <div className="h-4"></div>
    <h1 className='text-xl font-semibold'>Saved Questions</h1>
    <div className="h-2"></div>
    <div className="flex flex-col gap-2">
        {questions?.map((question,index)=>{
            return <React.Fragment key={question.id}>
                <SheetTrigger onClick={()=>setQuestionIndex(index)}>
                    <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow-border hover:cursor-pointer">
                        <img className='rounded-full' height={30} width={30} src={question.user.imageUrl??""}></img>
                        <div className="text-left flex flex-col">
                            <div className="flex items-center gap-2">
                                <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                                   {question.question}
                                </p>
                                <span className='text-xs text-gray-400 whitespace-nowrap'>
                                    {question.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                            <p className='text-gray-500 line-clamp-1 text-sm'>
                                {question.answer}
                            </p>
                        </div>
                    </div>
                </SheetTrigger>
            </React.Fragment>
        })}
    </div>
{question&&(
    <SheetContent className='sm:max-w-[80vw]'>
        <SheetHeader>
            <SheetTitle className='text-xl text-center mb-6 font-bold'>
                {question.question}
            </SheetTitle>
             <div data-color-mode="light">
                <MDEditor.Markdown source={question.answer} className="max-w-[70vw] !h-full max-h-[40vh] overflow-scroll scrollbar-hide " />
                </div>
            <CodeRefrences fileReferences={(question.fileReferences??[])as any}></CodeRefrences>
        </SheetHeader>
    </SheetContent>
)}
   </Sheet>
  )
}

export default QAPage