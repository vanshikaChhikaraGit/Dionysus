"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const Page = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const refetch = useRefetch()
  const router = useRouter()

  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation()

  function onSubmit(data: FormInput) {
    if(!!checkCredits.data){
      createProject.mutate(
        {
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            reset()
            refetch()
            router.push("/dashboard")
          },
  
          onError: () => {
            toast.error("Couldn't update project details");
            reset()
          },
        },
      );
    }else{
      checkCredits.mutate({
        githubUrl:data.repoUrl,
        githubToken:data.githubToken
      })
    }
  }

  const hasEnoughCredits = checkCredits.data?.userCredits? checkCredits.data.fileCount<=checkCredits.data.userCredits : true

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/undraw_github.svg" className="h-66 w-auto"></img>
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your repository to link to Dionysus
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            ></Input>
            <div className="h-2"></div>
            <Input
              type="url"
              {...register("repoUrl", { required: true })}
              placeholder="GitHub Repository URL"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (optional)"
            />
            {!!checkCredits.data&&(
              <>
              <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                <div className="flex items-center gap-2">
                  <Info className="size-4"></Info>
                  <p className="text-sm">You will be charged <strong>{checkCredits.data.fileCount}</strong> credits for this repository.</p>
                </div>
                <p className="text-sm text-blue-600 ml-6">
                  You have <strong>{checkCredits.data.userCredits}</strong> credits remaining.
                </p>
              </div>
              </>
            )}
            <div className="h-4"></div>
            <Button type={"submit"} className="hover:cursor-pointer" disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}>
              {!!checkCredits.data?'Create Project':'Check Credits'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
