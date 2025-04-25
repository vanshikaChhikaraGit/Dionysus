import { pollCommits } from "@/lib/github";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { cleanGithubUrl } from "@/utils/clean-github-url";
import { indexGithubRepo } from "@/lib/github-loader";

export const ProjectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const refinedUrl = cleanGithubUrl(input.githubUrl)
      if(!refinedUrl){
        throw new Error("Please enter valid github url format")
      }
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: refinedUrl,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await indexGithubRepo(project.id,refinedUrl,input.githubToken)
      await pollCommits(project.id);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedProcedure.input(
    z.object({
      projectId: z.string()
    })
  ).query(async ({ ctx,input })=>{
    pollCommits(input.projectId).then().catch(console.error)
    return await ctx.db.commit.findMany({
      where:{
        projectId:input.projectId
      }
    })
  })
});
