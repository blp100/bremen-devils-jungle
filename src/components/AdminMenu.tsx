"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { resetGame } from "@/utils";
import { Menu, Moon, Sun, RotateCcw, Monitor } from "lucide-react";
import { toast } from "sonner";

export const AdminMenu = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleResetGame = async () => {
    try {
      await resetGame();
      toast.success("遊戲已重置");
      setIsOpen(false);
    } catch (error) {
      toast.error("重置遊戲失敗");
    }
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      toast.success("已切換至深色模式");
    } else {
      setTheme("light");
      toast.success("已切換至淺色模式");
    }
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case "light":
        return "切換至深色模式";
      case "dark":
        return "切換至系統模式";
      default:
        return "切換至淺色模式";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Menu className="h-4 w-4" />
          <span className="sr-only">開啟選單</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {getThemeIcon()}
          <span className="ml-2">{getThemeText()}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleResetGame}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="ml-2">重置遊戲</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
