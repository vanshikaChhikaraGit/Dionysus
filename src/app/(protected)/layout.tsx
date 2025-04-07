import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import type React from "react";
import AppSideBar from "./app-sidebar";

type props = {
  children: React.ReactNode;
};

const SideBarLayout = ({ children }: props) => {
  return (
    <SidebarProvider>
      {/* side bar  */}
      <AppSideBar /> 
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* search bar  */}
          <div className="ml-auto"></div>
          <UserButton></UserButton>
        </div>
        <div className="h-4"></div>
        {/* main content  */}
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;
