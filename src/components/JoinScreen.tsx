"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Gamepad2 } from "lucide-react";

interface JoinScreenProps {
  onJoin: (nickname: string) => void;
  isJoining?: boolean;
}

export const JoinScreen = ({ onJoin, isJoining = false }: JoinScreenProps) => {
  const [nickname, setNickname] = useState("");

  const isValid = nickname.trim().length > 0 && nickname.trim().length <= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isJoining) {
      onJoin(nickname.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Gamepad2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">魔鬼的邀請</h1>
            <p className="text-muted-foreground text-sm">布萊梅</p>
          </div>
        </div>

        {/* Join Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5" />
              加入遊戲
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="nickname"
                  className="text-sm font-medium text-foreground"
                >
                  暱稱
                </label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="輸入你的暱稱"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full h-12 text-base rounded-xl border-2 focus:border-primary"
                  maxLength={20}
                  disabled={isJoining}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1-20 個字元</span>
                  <span>{nickname.length}/20</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValid || isJoining}
                className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isJoining ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>加入中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span>加入遊戲</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>請確保網路連線穩定</p>
        </div>
      </div>
    </div>
  );
};
