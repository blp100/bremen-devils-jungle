"use client";

import { useParams } from "react-router";
import { PlayerCard } from "@/components/PlayerCard";
import { usePlayer } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerTypeLabel } from "@/utils/labelHelper";

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

        {/* Game Information Section - Refactored */}
        <Card className="mt-4 border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              遊戲資訊
            </h3>

            {/* Element Type Info */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">元素類型</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-base">
                    {getPlayerTypeLabel(player.type)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    元素 {player.elementCount}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Player;
