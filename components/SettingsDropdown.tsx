"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsUpdate } from "@/hooks/useSettingsUpdate";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import React from "react";

const SettingsDropdown: React.FC = () => {
  const {handleThemeToggle,handleToggleSaveResults} = useSettingsUpdate().actions
  const {settings} = useSettingsUpdate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-32">
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={handleThemeToggle}>
          {settings.theme === "light" ? (
            <>
              <MoonIcon className="mr-2 h-4 w-4" />
              Switch to Dark Mode
            </>
          ) : (
            <>
              <SunIcon className="mr-2 h-4 w-4" />
              Switch to Light Mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleSaveResults}>
          {settings.saveResults ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Disable Save Results
            </>
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4 opacity-0" />
              Enable Save Results
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;
