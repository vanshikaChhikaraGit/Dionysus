'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/trpc/react'
import { Crown, Info } from 'lucide-react'
import React from 'react'

type Props = {}

const BillingPage = (props: Props) => {
    const { data:user } = api.project.getCredits.useQuery()
  return (
    <div>
        <h1 className='text-xl font-semibold'>Billing</h1>
        <div className="h-2"></div>
        <p className='text-sm text-gray-500'>
            You currently have <strong>{user?.credits}</strong>  credits
        </p>
        <div className="h-2"></div>
        <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
            <div className="flex items-center gap-2">
                <Info className='size-4'></Info>
                <p className='text-sm'>Each credit allows you to index1 file in a repository</p>
            </div>
            <p className='text-sm'>E.g., If your project has 100 files, you will need 100 credits to index it.</p>
        </div>
        <div className="h-4"></div>
        <div className="font-bold text-xl">
            
             <Card>
                <CardHeader>
                    <CardTitle>
                    <h1 className='flex items-center '>Get More Credits? <Badge className='bg-yellow-400 ml-1'>Premium <Crown></Crown> </Badge> </h1>
                    </CardTitle>
                </CardHeader>
                <CardContent>
               <p >Coming soon!</p> 
                </CardContent>
             </Card>
        </div>
    </div>
  )
}

export default BillingPage