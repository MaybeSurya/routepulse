"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem 
} from "@heroui/react";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Dropdown placement="bottom-end" className="bg-zinc-950 border border-zinc-800 shadow-2xl">
      <DropdownTrigger>
        <Button 
          variant="light" 
          isIconOnly
          className="text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Theme Selection"
        onAction={(key) => setTheme(key as string)}
      >
        <DropdownItem key="light" className="text-zinc-400 hover:text-white">Light</DropdownItem>
        <DropdownItem key="dark" className="text-white font-bold">Dark</DropdownItem>
        <DropdownItem key="system" className="text-zinc-500">System</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
