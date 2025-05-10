'use client'

import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import { useRouter } from "next/navigation";

export default async function Home() {
  const router = useRouter()
  return (
    router.push("/dashboard")
  )
}
