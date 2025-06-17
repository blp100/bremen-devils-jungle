"use client";

import { useState } from "react";
import type { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { toast } from "sonner";
import { handlePlayerAttack } from "@/services/combatServices";
import type { IGame } from "@/interfaces";
import { GAME_STAGE_TYPE, GAME_STAGES, EVOLUTION_TRAITS } from "@/constants";
import { updateData } from "@/services/firebaseHelpers";
import { Swords, RotateCcw, RefreshCw, Heart, SkipForward } from "lucide-react";

interface AdminCombatSelectorProps {
  players: IPlayer[];
  game: IGame;
  allPlayers: { [key: string]: IPlayer };
}

const TRAIT_LABELS: Record<string, string> = {
  [EVOLUTION_TRAITS.GENE_MUTATION]: "基因突變",
  [EVOLUTION_TRAITS.DEADLY_POISON]: "劇毒",
  [EVOLUTION_TRAITS.BLOODTHIRSTY]: "嗜血",
  [EVOLUTION_TRAITS.SHARP_SPIKES]: "尖刺",
  [EVOLUTION_TRAITS.HORUS_EYE]: "赫魯斯之眼",
  [EVOLUTION_TRAITS.AMPHIBIOUS]: "兩棲",
  [EVOLUTION_TRAITS.PARASITIC]: "寄生",
  [EVOLUTION_TRAITS.FOREST_SCEPTER]: "森林權杖",
  [EVOLUTION_TRAITS.TAIL_REGROWTH]: "斷尾",
  [EVOLUTION_TRAITS.SPECIES_EXTINCTION]: "物種消亡",
  [EVOLUTION_TRAITS.LION_KING]: "獅子王",
  [EVOLUTION_TRAITS.FIERCE_GAZE]: "兇狠目光",
  [EVOLUTION_TRAITS.HIBERNATION]: "冬眠",
  [EVOLUTION_TRAITS.SCAVENGER]: "食腐",
};

const PLAYER_TYPE_LABELS: Record<string, string> = {
  fire: "火",
  water: "水",
  wood: "木",
  electric: "電",
};

export const AdminCombatSelector = ({
  players,
  game,
  allPlayers,
}: AdminCombatSelectorProps) => {
  const [attacker, setAttacker] = useState<IPlayer | null>(null);
  const [target, setTarget] = useState<IPlayer | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isPassing, setIsPassing] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);

  const canBeAttacker = (player: IPlayer) => !player.isResting;
  const canBeTarget = (player: IPlayer) => !player.protected;
  const isDisabled = (player: IPlayer) => {
    if (!attacker) return !canBeAttacker(player);
    if (!target && player.id !== attacker.id) return !canBeTarget(player);
    return false;
  };

  const currentStage = GAME_STAGES[game.stageIndex];
  const currentStageDamage =
    currentStage.type === GAME_STAGE_TYPE.COMBAT && currentStage.damage;

  const handleSelectPlayer = (player: IPlayer) => {
    if (!attacker && canBeAttacker(player)) {
      setAttacker(player);
    } else if (
      attacker &&
      !target &&
      player.id !== attacker.id &&
      canBeTarget(player)
    ) {
      setTarget(player);
    }
  };

  const handleReset = () => {
    setAttacker(null);
    setTarget(null);
  };

  const handleAttack = async () => {
    if (attacker && target) {
      const result = await handlePlayerAttack(
        attacker,
        target,
        allPlayers,
        game,
      );

      if (result.success) {
        toast.success(
          `${attacker.nickname} 攻擊成功，對 ${target.nickname} 造成 ${result.damageDealt} 傷害`,
        );
      } else {
        toast.error(
          `${attacker.nickname} 攻擊失敗，損失 ${result.damageDealt} 血量，${target.nickname} 回復同等血量`,
        );
      }

      handleReset();
    }
  };

  const handlePass = async () => {
    if (!attacker) return;

    setIsPassing(true);
    try {
      const hasAlreadyPassed = attacker.isPassed;

      const updatePayload: Partial<IPlayer> = {
        isPassed: true,
      };

      let toastMessage = `${attacker.nickname} 已跳過此回合`;

      // If player has already passed, apply damage penalty first
      if (hasAlreadyPassed && currentStage?.type === GAME_STAGE_TYPE.COMBAT) {
        const damage = currentStage.damage;
        const newHp = Math.max(0, attacker.hp - damage);
        updatePayload.isResting = true;
        updatePayload.hp = newHp;
        toastMessage = `${attacker.nickname} 再次跳過並受到 ${damage} 點傷害懲罰`;
      }

      await updateData(`players/${attacker.id}`, updatePayload);
      toast.success(toastMessage);
      handleReset();
    } catch (error) {
      toast.error("跳過操作失敗");
      console.error("Error passing turn:", error);
    } finally {
      setIsPassing(false);
    }
  };

  const handleResetAllCombatState = async () => {
    setIsResetting(true);

    try {
      const updatePromises = Object.values(allPlayers).map(async (player) => {
        const updatePayload: Partial<IPlayer> = {
          hp: 25,
          isResting: false,
          protected: false,
          isPassed: false,
        };

        return updateData(`players/${player.id}`, updatePayload);
      });

      await Promise.all(updatePromises);
      toast.success(`已重置所有玩家的血量與戰鬥狀態`);
      handleReset();
    } catch (error) {
      toast.error("重置戰鬥狀態失敗");
      console.error("Error resetting combat state:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const getTraitLabel = (trait: string) => {
    return TRAIT_LABELS[trait] || trait;
  };

  const getPlayerTypeLabel = (type: string) => {
    return PLAYER_TYPE_LABELS[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Player Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPlayers.map((player) => (
          <Button
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            disabled={isDisabled(player)}
            variant="outline"
            className={clsx(
              "flex justify-between items-center p-6 h-auto min-h-[80px] text-left hover:bg-muted/50 dark:hover:bg-muted/50",
              isDisabled(player) && "opacity-50 cursor-not-allowed",
              attacker?.id === player.id &&
                "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:ring-blue-400",
              target?.id === player.id &&
                "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 dark:ring-red-400",
            )}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="font-semibold text-base">
                  {player.number} {player.nickname}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getPlayerTypeLabel(player.type)} • 元素 {player.elementCount}
                </div>

                {(player.isResting || player.protected || player.isPassed) && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {player.isResting && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                        回合結束
                      </span>
                    )}
                    {player.protected && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                        保護區
                      </span>
                    )}
                    {player.isPassed && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                        已跳過
                      </span>
                    )}
                  </div>
                )}

                {/* Evolution Traits */}
                {player.evolutionCards && player.evolutionCards.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {player.evolutionCards.map((trait, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {getTraitLabel(trait)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
                <span className="text-xl font-bold">{player.hp}</span>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {attacker?.id === player.id && (
                  <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                )}
                {target?.id === player.id && (
                  <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Pass Action Section - Appears between grid and selection status when attacker is selected */}
      {attacker && (
        // Add this line only for pass button functionality

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <span className="font-medium text-sm">
                  已選擇攻擊者：{attacker.number} {attacker.nickname}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {attacker.isPassed ? (
                  <span className="text-amber-600 dark:text-amber-400">
                    ⚠️ 此玩家已跳過，再次跳過將受到 {currentStageDamage}{" "}
                    點傷害懲罰
                  </span>
                ) : (
                  <span>可以選擇目標進行攻擊，或跳過此回合</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                onClick={handlePass}
                disabled={isPassing}
                variant="outline"
                className="bg-background border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 min-h-[44px] px-6"
              >
                {isPassing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>跳過中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SkipForward className="h-4 w-4" />
                    <span>跳過回合</span>
                    {attacker.isPassed && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                        -{currentStageDamage} HP
                      </span>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Status */}
      {(attacker || target) && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          {attacker && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              <span>
                攻擊者：玩家 {attacker.number}（{attacker.nickname}）
              </span>
            </div>
          )}
          {target && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
              <span>
                目標：玩家 {target.number}（{target.nickname}）
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAttack}
            disabled={!attacker || !target}
            className="flex-1 min-h-[44px] text-sm"
            size="lg"
          >
            <Swords className="h-4 w-4 mr-2" />
            執行攻擊
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none min-h-[44px] text-sm"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重新選擇
          </Button>
        </div>

        <Button
          variant="destructive"
          onClick={handleResetAllCombatState}
          disabled={isResetting}
          className="w-full min-h-[44px] text-sm"
          size="lg"
        >
          {isResetting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
              <span>重置中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>重置血量與戰鬥狀態</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
