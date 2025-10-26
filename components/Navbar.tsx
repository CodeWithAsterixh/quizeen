"use client";

import { useAppSelector } from "@/lib/hooks";
import clsx from "clsx";
import { LogInIcon, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import LogOutModal from "./LogOutModal";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { SheetDescription, SheetTitle } from "./ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import UserAccountDropDown from "./UserAccountDropDown";
import Image from "next/image";

const Navbar: React.FC = () => {
  const {user,role} = useAppSelector((s) => s.auth);
  const { isMobile } = useSidebar();
  const userAvatarFallback = `${user?.fullName.split(" ")[0].charAt(0)}${user?.fullName.split(" ").slice(-1)[0].charAt(0)}`


  return (
    
    <>
    <nav className={clsx("bg-white shadow-md z-10", "px-4 py-2", "sticky top-0")}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-xl font-bold text-gray-800 flex items-center gap-1">
        <Image className="size-7" src={"/assets/icon.svg"} alt="quizeen icon" width={100} height={100} loading="lazy"/>
          Quizeen
        </Link>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {user && (role === "admin" || role === "creator") && (
            <Link href={"/new"}>
              <Button>Create New Quiz</Button>
            </Link>
          )}
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            Home
          </Link>
          <Link href="/quizzes" className="text-gray-600 hover:text-gray-800">
            Quizzes
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-800">
            About
          </Link>

          {role === "admin" || role === "student" || role === "creator" ? (
            <>
              <Link
                href="/results"
                className="text-gray-600 hover:text-gray-800"
              >
                Results
              </Link>
              <UserAccountDropDown />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="bg-gradient-to-br from-neutral-800 to-neutral-500 duration-300 hover:bg-gradient-to-l hover:scale-105 text-white px-3 py-1 rounded-md"
            >
              Sign in
            </Link>
          )}
        </div>
        {/* Mobile Menu Toggle */}
        {isMobile && <SidebarTrigger className="size-6 *:!size-6" />}
      </div>
      {/* Mobile Menu */}
      
    </nav>
    {isMobile && (
        <Sidebar>
          <SidebarHeader>
            <SheetTitle className="text-xl flex items-center gap-1">
        <Image className="size-7" src={"/assets/icon.svg"} alt="quizeen icon" width={100} height={100} loading="lazy"/>
              
              Quizeen</SheetTitle>
            <SheetDescription className="hidden">
              
              Quiz Platform
            </SheetDescription>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="space-y-2">
              <SidebarGroupContent className="bg-neutral-100 rounded-md">
                <Link
                  href="/"
                  className="block py-2 text-base text-gray-600 hover:text-gray-800 p-2"
                >
                  Home
                </Link>
              </SidebarGroupContent>
              <SidebarGroupContent className="bg-neutral-100 rounded-md">
                <Link
                  href="/quizzes"
                  className="block text-base text-gray-600 hover:text-gray-800 p-2"
                >
                  Quizzes
                </Link>
              </SidebarGroupContent>
              <SidebarGroupContent className="bg-neutral-100 rounded-md">
                <Link
                  href="/about"
                  className="block text-base text-gray-600 hover:text-gray-800 p-2"
                >
                  About
                </Link>
              </SidebarGroupContent>
              {role === "admin" || role === "student" && (
                <SidebarGroupContent className="bg-neutral-100 rounded-md">
                  <Link
                    href="/results"
                    className="block p-2 text-base text-gray-600 hover:text-gray-800"
                  >
                    Result
                  </Link>
                </SidebarGroupContent>
            )}
            </SidebarGroup>

            {user && (role === "admin" || role === "creator") && (
              <SidebarGroup>
                <SidebarGroupContent className="bg-neutral-900 hover:bg-neutral-800 rounded-md">
                  <Link
                    href="/new"
                    className="p-2 text-neutral-300 flex items-center gap-2"
                  >
                    <Plus/>
                    Create New Quiz
                  </Link>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <SidebarGroup>
              {user ? (
                <SidebarGroupContent className="bg-neutral-300 rounded-md p-2 flex gap-2 items-center justify-center">
                  <Link href={"/account"} className="w-full flex gap-2 items-center justify-center">

                  <Avatar>
                    <AvatarFallback className="font-bold uppercase text-neutral-500">{userAvatarFallback}</AvatarFallback>
                  </Avatar>
                  <div className="w-full flex flex-col gap-1 justify-center">
                    <b className="text-sm line-clamp-1">{user.fullName}</b>
                    <b className="text-xs text-neutral-500 line-clamp-1">{user.email}</b>
                  </div>
                  </Link>
                  <LogOutModal
                    trigger={
                      <span className="cursor-pointer">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <LogOut className="size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Logout</p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    }
                  />
                </SidebarGroupContent>
              ) : (
                <SidebarGroupContent className="bg-neutral-800 rounded-md p-2 flex gap-2 items-center justify-center">
                  <Link
                    href="/auth/login"
                    className="w-full py-2 px-3 rounded-md  text-white flex items-center gap-2"
                  >
                   <LogInIcon className="size-5"/> Sign in
                  </Link>
                </SidebarGroupContent>
              )}
              
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>
      )}
    </>
  );
};

export default Navbar;


