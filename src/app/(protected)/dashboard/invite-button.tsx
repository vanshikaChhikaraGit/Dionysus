import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useProject from '@/hooks/use-project'
import { Copy } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {}

const InviteButton = (props: Props) => {
    const { projectId } = useProject()
    const [ open,setOpen ] = useState(false)
  return (
    <div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Members</DialogTitle>
                </DialogHeader>
                <p className='text-sm text-gray-500'>
                    Ask them to copy paste this link
                </p>
                <div className='flex items-center justify-center'>
                <Input className='' readOnly value={`${window.location.origin}/join/${projectId}`}></Input>
          <Copy size={18} className='ml-1' onClick={()=>{
            navigator.clipboard.writeText(`${window.location.origin}/join/${projectId}`)
            toast.success("Copied to clipboard")}}></Copy>
                </div>
                  </DialogContent>
        </Dialog>
        <Button onClick={()=>setOpen(true)} className='hover:cursor-pointer'>Invite Members</Button>
    </div>
  )
}

export default InviteButton