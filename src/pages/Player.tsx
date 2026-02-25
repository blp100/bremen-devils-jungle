"use client";

import { useState } from "react";
import { useParams } from "react-router";
import { PlayerCard } from "@/components/PlayerCard";
import { usePlayer, useGame, usePlayers } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateData } from "@/services/firebaseHelpers";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Gamepad2,
  Crown,
  Bug,
  Check,
  Users,
  X,
} from "lucide-react";
import { getPlayerTypeLabel, getTraitLabel } from "@/utils/labelHelper";
import { EVOLUTION_TRAITS, GAME_STAGE_TYPE, GAME_STAGES } from "@/constants";
import { toast } from "sonner";

const Player = () => {
  const params = useParams();
  const { data: player, loading } = usePlayer(params.playerId);
  const { data: game } = useGame();
  const { data: allPlayers } = usePlayers();

  const [activeTraitSelection, setActiveTraitSelection] =
    useState<EVOLUTION_TRAITS | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleTraitClick = (trait: EVOLUTION_TRAITS) => {
    // Check if trait already has a target (prevent re-selection)
    const hasTarget =
      trait === EVOLUTION_TRAITS.PARASITIC
        ? player?.parasiticTargetId
        : player?.minionId;

    if (hasTarget) return; // Already selected, do nothing

    setActiveTraitSelection(trait);
    setSelectedTargetId(null);
  };

  const handleTargetSelect = (targetId: string) => {
    setSelectedTargetId(targetId);
  };

  const handleConfirm = async () => {
    if (!player || !activeTraitSelection || !selectedTargetId) return;

    setIsConfirming(true);

    try {
      const traitField =
        activeTraitSelection === EVOLUTION_TRAITS.PARASITIC
          ? "parasiticTargetId"
          : "minionId";

      await updateData(`players/${player.id}`, {
        [traitField]: selectedTargetId,
      });

      const targetPlayer = allPlayers?.[selectedTargetId];
      const traitLabel = getTraitLabel(activeTraitSelection);
      const targetName = targetPlayer
        ? `${targetPlayer.number} ${targetPlayer.nickname}`
        : "未知玩家";

      toast.success(`已選擇 ${targetName} 作為 ${traitLabel} 的目標`);

      // Close the selection UI
      setActiveTraitSelection(null);
      setSelectedTargetId(null);
    } catch (error) {
      toast.error("選擇目標失敗");
      console.error("Error selecting target:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setActiveTraitSelection(null);
    setSelectedTargetId(null);
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

  // Check if we should show target selection
  const currentStageIndex = game?.stageIndex ?? 0;
  const currentStage = GAME_STAGES[currentStageIndex];
  const isDiscussionStage = currentStage?.type === GAME_STAGE_TYPE.DISCUSSION;
  const isPreparationStage = currentStage?.type === GAME_STAGE_TYPE.PREPARATION;
  const hasParasitic = player.evolutionCards?.includes(
    EVOLUTION_TRAITS.PARASITIC,
  );
  const hasLionKing = player.evolutionCards?.includes(
    EVOLUTION_TRAITS.LION_KING,
  );
  const shouldShowTraitSelection =
    isDiscussionStage && (hasParasitic || hasLionKing);

  // Get other players (exclude self and dead players)
  const otherPlayers = allPlayers
    ? Object.values(allPlayers).filter((p) => p.id !== player.id && !p.isDead)
    : [];

  // Check if traits already have targets
  const parasiticTarget =
    player.parasiticTargetId && allPlayers?.[player.parasiticTargetId];
  const lionKingTarget = player.minionId && allPlayers?.[player.minionId];

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

      <div className="w-full max-w-screen-sm mx-auto p-4 space-y-4">
        {/* Player Card */}
        <PlayerCard player={player} showDetailed={!isPreparationStage} />

        {/* Trait Target Selection Section */}
        {shouldShowTraitSelection && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                性狀目標選擇
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Trait Selection Buttons */}
              <div className="space-y-3">
                {hasParasitic && (
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        handleTraitClick(EVOLUTION_TRAITS.PARASITIC)
                      }
                      disabled={
                        !!parasiticTarget || activeTraitSelection !== null
                      }
                      variant="outline"
                      className={`w-full justify-between p-4 h-auto min-h-[60px] text-left ${
                        parasiticTarget
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 cursor-default"
                          : "hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Bug className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-semibold text-sm">
                            {getTraitLabel(EVOLUTION_TRAITS.PARASITIC)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {parasiticTarget
                              ? "已選擇目標"
                              : "點擊選擇寄生目標"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {parasiticTarget ? (
                          <div className="text-sm font-medium text-green-700 dark:text-green-300">
                            目標: {parasiticTarget.number}{" "}
                            {parasiticTarget.nickname}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            未選擇
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                )}

                {hasLionKing && (
                  <div className="space-y-2">
                    <Button
                      onClick={() =>
                        handleTraitClick(EVOLUTION_TRAITS.LION_KING)
                      }
                      disabled={
                        !!lionKingTarget || activeTraitSelection !== null
                      }
                      variant="outline"
                      className={`w-full justify-between p-4 h-auto min-h-[60px] text-left ${
                        lionKingTarget
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 cursor-default"
                          : "hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                          <div className="font-semibold text-sm">
                            {getTraitLabel(EVOLUTION_TRAITS.LION_KING)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lionKingTarget ? "已選擇手下" : "點擊選擇手下"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {lionKingTarget ? (
                          <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                            手下: {lionKingTarget.number}{" "}
                            {lionKingTarget.nickname}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            未選擇
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                )}
              </div>

              {/* Target Selection Modal */}
              {activeTraitSelection && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {activeTraitSelection === EVOLUTION_TRAITS.PARASITIC ? (
                        <Bug className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <span className="font-medium text-sm">
                        選擇 {getTraitLabel(activeTraitSelection)} 的目標
                      </span>
                    </div>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Player List */}
                  {otherPlayers.length > 0 ? (
                    <div className="space-y-3">
                      <ScrollArea className="h-[200px] pr-2">
                        <div className="space-y-2">
                          {otherPlayers.map((targetPlayer) => (
                            <Button
                              key={targetPlayer.id}
                              onClick={() =>
                                handleTargetSelect(targetPlayer.id)
                              }
                              variant="outline"
                              className={`w-full justify-start p-3 h-auto text-left transition-colors ${
                                selectedTargetId === targetPlayer.id
                                  ? "ring-2 ring-primary bg-primary/10 border-primary/20"
                                  : "hover:bg-muted/50 dark:hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    {targetPlayer.number}
                                  </div>
                                  <span className="font-medium text-sm">
                                    {targetPlayer.nickname}
                                  </span>
                                </div>
                                {selectedTargetId === targetPlayer.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Confirm Button */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleConfirm}
                          disabled={!selectedTargetId || isConfirming}
                          className="flex-1 min-h-[44px]"
                        >
                          {isConfirming ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>確認中...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              <span>確認選擇</span>
                            </div>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="px-4 min-h-[44px] bg-transparent"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">沒有可選擇的目標玩家</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Game Information Section */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-primary" />
              遊戲資訊
            </h3>
            {/* Element Type Info */}
            {!isPreparationStage && (
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      元素類型
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-base">
                      {getPlayerTypeLabel(player.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {player.elementCount !== 0
                        ? ` • 元素 ${player.elementCount}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Player;
