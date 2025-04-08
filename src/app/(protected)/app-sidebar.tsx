"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_ICONS } from "@/constants/constants";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


const AppSideBar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects,projectId,setProjectId } = useProject()
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image
            className=""
            src={"/logo.png"}
            alt="logo"
            width={40}
            height={40}
          ></Image>
          {open && (
            <h1 className="text-primary/80 text-xl font-bold">Dionysus</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* navigation items  */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_ICONS.map((icon) => (
                <SidebarMenuItem key={icon.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={icon.url}
                      className={cn(
                        {
                          "!bg-primary !text-white": pathname === icon.url,
                        },
                        "list-none",
                      )}
                    >
                      <icon.icon />
                      <span>{icon.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* user projects and feature to add more projects*/}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div onClick={()=>setProjectId(project.id)}>
                      <div
                        className={cn(
                          "text-primary hover:cursor-pointer flex size-6 items-center justify-center rounded-sm border bg-white text-sm",
                          {
                            "bg-primary text-white": project.id===projectId,
                          },
                        )}
                      >
                      <span className="p-2">{project.name.charAt(0)}</span>  
                      </div>
                      <span className="hover:cursor-pointer">
                        {project.name}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"> </div>
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create"}>
                    <Button
                      size={"sm"}
                      className="w-fit hover:cursor-pointer"
                      variant={"outline"}
                    >
                      <Plus></Plus>
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
