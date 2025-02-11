"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setTheme, toggleSaveResults } from "@/lib/features/settingsSlice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";

const SettingsDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, saveResults } = useSelector((state: RootState) => state.settings);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  const handleToggleSaveResults = () => {
    dispatch(toggleSaveResults());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-32">
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem onClick={handleThemeToggle}>
          {theme === "light" ? (
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
          {saveResults ? (
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
