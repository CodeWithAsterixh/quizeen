"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/lib/hooks";
import { LogOut, User2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import LogOutModal from "./LogOutModal";
import { Avatar, AvatarFallback } from "./ui/avatar";

const UserAccountDropDown: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const userAvatarFallback = `${user?.fullName.split(" ")[0].charAt(0)}${user?.fullName.split(" ").slice(-1)[0].charAt(0)}`

  if (!user) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarFallback className="font-bold uppercase text-neutral-500 cursor-pointer">
            {userAvatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 relative right-2">
        <DropdownMenuItem asChild>
          <Link href="/account">
            <User2 />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0" asChild>
          
          <LogOutModal trigger={
            <span className="w-full flex items-center cursor-pointer gap-2 text-sm bg-neutral-200 p-2 rounded-sm">
            <LogOut className="size-4" />
            Logout
            </span>
          } />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountDropDown;
