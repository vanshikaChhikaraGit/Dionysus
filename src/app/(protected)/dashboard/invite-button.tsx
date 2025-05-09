'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useProject from '@/hooks/use-project'
import { Copy } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

const InviteButton = () => {
    const { projectId } = useProject()
    const [open, setOpen] = useState(false)
    const [inviteLink, setInviteLink] = useState('')

    useEffect(() => {
        // This will only run on client side
        setInviteLink(`${window.location.origin}/join/${projectId}`)
    }, [projectId])

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink)
            .then(() => toast.success("Copied to clipboard"))
            .catch(() => toast.error("Failed to copy"))
    }

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
                    <div className='flex items-center gap-2'>
                        <Input readOnly value={inviteLink} />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleCopy}
                            disabled={!inviteLink}
                        >
                            <Copy size={18} />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Button onClick={() => setOpen(true)}>
                Invite Members
            </Button>
        </div>
    )
}

export default InviteButton