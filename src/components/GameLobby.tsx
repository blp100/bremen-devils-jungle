"use client";

import { useState } from "react";
import { PlayerGrid } from "./PlayerGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Play, Copy, Check } from "lucide-react";
import type { IPlayer } from "@/interfaces";

interface GameLobbyProps {
  players: IPlayer[];
  minPlayers: number;
  maxPlayers: number;
  onStartGame?: () => void;
  canStart?: boolean;
  isStarting?: boolean;
  joinUrl?: string;
}

export const GameLobby = ({
  players,
  minPlayers,
  maxPlayers,
  onStartGame,
  canStart = false,
  isStarting = false,
  joinUrl = "",
}: GameLobbyProps) => {
  const [copied, setCopied] = useState(false);

  const playerCount = players.length;
  const hasEnoughPlayers = playerCount >= minPlayers;

  const handleCopyUrl = async () => {
    if (joinUrl) {
      try {
        await navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="w-full max-w-screen-sm mx-auto px-4 py-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">遊戲大廳</h1>
            <p className="text-sm text-muted-foreground">等待玩家加入中...</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-sm mx-auto p-4 space-y-4">
        {/* Game Status Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              遊戲狀態
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Player Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">玩家人數</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{playerCount}</span>
                <span className="text-sm text-muted-foreground">
                  / {maxPlayers}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {hasEnoughPlayers ? (
                <Badge className="bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                  可以開始遊戲
                </Badge>
              ) : (
                <Badge variant="secondary">需要至少 {minPlayers} 位玩家</Badge>
              )}
            </div>

            {/* Join URL */}
            {joinUrl && (
              <div className="space-y-2">
                <div className="text-sm font-medium">邀請連結</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm font-mono truncate">
                    {joinUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className="flex-shrink-0 bg-transparent"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Start Game Button */}
            {onStartGame && (
              <Button
                onClick={onStartGame}
                disabled={!canStart || !hasEnoughPlayers || isStarting}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isStarting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>開始中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    <span>開始遊戲</span>
                  </div>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Player List */}
        <PlayerGrid players={players} title="已加入玩家" showDetailed={false} />
      </div>
    </div>
  );
};
