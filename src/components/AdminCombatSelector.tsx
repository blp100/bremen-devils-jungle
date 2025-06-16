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
import { Swords, RotateCcw, Zap, RefreshCw } from "lucide-react";

interface AdminCombatSelectorProps {
  players: IPlayer[];
  game: IGame;
  allPlayers: { [key: string]: IPlayer };
}

// Chinese trait name mapping (same as in AdminTraitAssignment)
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

// Player type Chinese labels
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

  // Sort players by their number property
  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);

  const canBeAttacker = (player: IPlayer) => !player.isResting;
  const canBeTarget = (player: IPlayer) => !player.protected;
  const isDisabled = (player: IPlayer) => {
    if (!attacker) return !canBeAttacker(player);
    if (!target && player.id !== attacker.id) return !canBeTarget(player);
    return false;
  };
  const isCombatStage =
    GAME_STAGES[game.stageIndex]?.type === GAME_STAGE_TYPE.COMBAT;

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

  const handleResetAllCombatState = async () => {
    setIsResetting(true);

    try {
      // Create update promises for all players
      const updatePromises = Object.values(allPlayers).map(async (player) => {
        const updatePayload: Partial<IPlayer> = {
          hp: 25,
          isResting: false,
          protected: false,
        };

        return updateData(`players/${player.id}`, updatePayload);
      });

      // Execute all updates
      await Promise.all(updatePromises);

      toast.success(`已重置所有玩家的血量與戰鬥狀態`);

      // Clear current selection
      handleReset();
    } catch (error) {
      toast.error("重置戰鬥狀態失敗");
      console.error("Error resetting combat state:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const isSelected = (player: IPlayer) => {
    return attacker?.id === player.id || target?.id === player.id;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedPlayers.map((player) => (
          <Button
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            disabled={isDisabled(player)}
            variant="outline"
            className={clsx(
              "flex flex-col items-start justify-start py-4 px-4 min-h-[100px] text-left relative h-auto",
              isDisabled(player) && "opacity-50 cursor-not-allowed",
              attacker?.id === player.id &&
                "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
              target?.id === player.id &&
                "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20",
              isSelected(player) && "font-bold",
            )}
          >
            <div className="w-full space-y-2">
              {/* Player Name and Number */}
              <div className="flex items-center justify-between w-full">
                <div className="text-base font-semibold">
                  {player.number} {player.nickname}
                </div>
                {attacker?.id === player.id && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
                {target?.id === player.id && (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>

              {/* HP and Type */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">HP: {player.hp}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {getPlayerTypeLabel(player.type)}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  元素 {player.elementCount}
                </span>
              </div>

              {/* Evolution Traits */}
              {player.evolutionCards && player.evolutionCards.length > 0 && (
                <div className="w-full">
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

              {/* Status Indicators */}
              <div className="flex gap-1 flex-wrap">
                {player.isResting && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                    回合結束
                  </span>
                )}
                {player.protected && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    保護區
                  </span>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Selection Status */}
      {(attacker || target) && (
        <div className="bg-muted p-4 rounded-lg space-y-2">
          {attacker && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>
                攻擊者：玩家 {attacker.number}（{attacker.nickname}）
              </span>
            </div>
          )}
          {target && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                目標：玩家 {target.number}（{target.nickname}）
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Primary Combat Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAttack}
            disabled={!attacker || !target || !isCombatStage}
            className="flex-1 min-h-[48px] text-base"
            size="lg"
          >
            <Swords className="h-5 w-5 mr-2" />
            執行攻擊
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 sm:flex-none min-h-[48px] text-base"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            重新選擇
          </Button>
        </div>

        {/* Reset Combat State Button */}
        <Button
          variant="destructive"
          onClick={handleResetAllCombatState}
          disabled={isResetting}
          className="w-full min-h-[48px] text-base"
          size="lg"
        >
          {isResetting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>重置中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <span>重置血量與戰鬥狀態</span>
            </div>
          )}
        </Button>
      </div>

      {!isCombatStage && (
        <div className="text-center text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <Zap className="h-4 w-4 inline mr-1" />
          當前不是戰鬥階段，無法執行攻擊
        </div>
      )}
    </div>
  );
};
