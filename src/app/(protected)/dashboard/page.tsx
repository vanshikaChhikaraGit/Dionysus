"use client"

import { useUser } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
    const user = useUser()
  return (
    <div>{user.user?.fullName}</div>
  )
}

export default Page