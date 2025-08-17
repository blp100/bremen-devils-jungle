"use client";

import { useParams } from "react-router";
import { PlayerCard } from "@/components/PlayerCard";
import { usePlayer } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Player = () => {
  const params = useParams();
  const { data: player, loading } = usePlayer(params.playerId);

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">載入玩家資料中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center space-y-2">
              <p className="font-semibold">找不到玩家</p>
              <p className="text-sm text-muted-foreground">
                請檢查連結是否正確，或聯繫遊戲管理員
              </p>
            </div>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="mt-4 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="w-full max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                玩家資料
              </h1>
              <p className="text-sm text-muted-foreground">
                {player.nickname} 的遊戲狀態
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Card */}
      <div className="w-full max-w-screen-sm mx-auto p-4">
        <PlayerCard player={player} showDetailed={true} />
      </div>

      {/* Additional Game Info */}
      <Card className="mt-4 border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-base">遊戲資訊</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">玩家 ID</span>
              <p className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                {player.id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">元素類型</span>
              <p className="font-medium mt-1">
                {player.type} • 數量 {player.elementCount}
              </p>
            </div>
          </div>

          {/* Attack Cards Info */}
          {player.attackCards && Object.keys(player.attackCards).length > 0 && (
            <div>
              <span className="text-muted-foreground text-sm">攻擊卡片</span>
              <div className="mt-2 space-y-1">
                {Object.entries(player.attackCards).map(
                  ([targetNumber, count]) => (
                    <div
                      key={targetNumber}
                      className="flex justify-between text-sm"
                    >
                      <span>對玩家 {targetNumber}</span>
                      <span className="font-medium">{count} 張</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Player;
