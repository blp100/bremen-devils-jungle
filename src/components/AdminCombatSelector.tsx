"use client";

import { useState } from "react";
import type { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { toast } from "sonner";
import { handlePlayerAttack } from "@/services/combatServices";
import type { IGame } from "@/interfaces";
import { GAME_STAGE_TYPE, GAME_STAGES } from "@/constants";
import { getTraitLabel, getPlayerTypeLabel } from "@/utils/labelHelper";
import { updateData } from "@/services/firebaseHelpers";
import {
  Swords,
  RotateCcw,
  RefreshCw,
  Heart,
  SkipForward,
  Skull,
} from "lucide-react";
import { CombatResultModal } from "@/components/CombatResultModal";
import { TailRegrowthModal } from "@/components/TailRegrowthModal";
import { EVOLUTION_TRAITS } from "@/constants";

interface AdminCombatSelectorProps {
  players: IPlayer[];
  game: IGame;
  allPlayers: { [key: string]: IPlayer };
}

interface CombatResult {
  success: boolean;
  reason: string;
  attacker: IPlayer;
  target: IPlayer;
  damageDealt: number;
  traitsTriggered: any[];
}

interface TailRegrowthDecisions {
  main?: boolean;
  minion?: boolean;
}

export const AdminCombatSelector = ({
  players,
  game,
  allPlayers,
}: AdminCombatSelectorProps) => {
  const [attacker, setAttacker] = useState<IPlayer | null>(null);
  const [target, setTarget] = useState<IPlayer | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  // Combat result modal state
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [originalAttacker, setOriginalAttacker] = useState<IPlayer | null>(
    null,
  );
  const [originalTarget, setOriginalTarget] = useState<IPlayer | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Tail Regrowth modal state
  const [showTailRegrowthModal, setShowTailRegrowthModal] = useState(false);
  const [currentTailType, setCurrentTailType] = useState<"main" | "minion">(
    "main",
  );
  const [pendingCombat, setPendingCombat] = useState<{
    attacker: IPlayer;
    target: IPlayer;
  } | null>(null);
  const [tailRegrowthDecisions, setTailRegrowthDecisions] =
    useState<TailRegrowthDecisions>({});

  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);

  const canBeAttacker = (player: IPlayer) =>
    !player.isResting && !player.isDead;
  const canBeTarget = (player: IPlayer) => !player.protected && !player.isDead;
  const isDisabled = (player: IPlayer) => {
    if (player.isDead) return true;
    if (!attacker) return !canBeAttacker(player);
    if (!target && player.id !== attacker.id) return !canBeTarget(player);
    return false;
  };

  const currentStage = GAME_STAGES[game.stageIndex];
  const currentStageDamage =
    currentStage.type === GAME_STAGE_TYPE.COMBAT && currentStage.damage;

  const handleSelectPlayer = (player: IPlayer) => {
    if (player.isDead) return;

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
    setPendingCombat(null);
    setTailRegrowthDecisions({});
    setCurrentTailType("main");
  };

  // Check if Lion King has a valid minion that would attack the target
  const hasLionKingMinion = (
    attackerPlayer: IPlayer,
    targetPlayer: IPlayer,
  ) => {
    if (!attackerPlayer.evolutionCards?.includes(EVOLUTION_TRAITS.LION_KING)) {
      return false;
    }

    const minionId = attackerPlayer.minionId;
    if (!minionId || !allPlayers[minionId]) {
      return false;
    }

    const minion = allPlayers[minionId];
    return !minion.isDead && minion.id !== targetPlayer.id;
  };

  const handleAttack = async () => {
    if (attacker && target && !isAttacking) {
      // Check if target has TAIL_REGROWTH trait
      const hasTailRegrowth = target.evolutionCards?.includes(
        EVOLUTION_TRAITS.TAIL_REGROWTH,
      );

      if (hasTailRegrowth) {
        // Store pending combat and start the modal sequence
        setPendingCombat({ attacker, target });
        setTailRegrowthDecisions({});
        setCurrentTailType("main");
        setShowTailRegrowthModal(true);
        return;
      }

      // Proceed with normal combat if no tail regrowth
      await executeCombat(attacker, target, {});
    }
  };

  const executeCombat = async (
    attackerPlayer: IPlayer,
    targetPlayer: IPlayer,
    decisions: TailRegrowthDecisions,
  ) => {
    setIsAttacking(true);

    // Store original states before combat
    setOriginalAttacker({ ...attackerPlayer });
    setOriginalTarget({ ...targetPlayer });

    try {
      // Apply tail regrowth decisions before combat
      const updatedTarget = { ...targetPlayer };

      if (decisions.main !== undefined) {
        updatedTarget.hasUsedTailRegrowth = decisions.main;
        await updateData(`players/${targetPlayer.id}`, {
          hasUsedTailRegrowth: decisions.main,
        });
      }

      if (decisions.minion !== undefined) {
        updatedTarget.hasUsedMinionTailRegrowth = decisions.minion;
        await updateData(`players/${targetPlayer.id}`, {
          hasUsedTailRegrowth: decisions.minion,
        });
      }

      const result = await handlePlayerAttack(
        attackerPlayer,
        updatedTarget,
        allPlayers,
        game,
      );

      // Set combat result and show modal
      setCombatResult(result);
      setShowResultModal(true);

      // Don't reset selection here - wait for modal confirmation
    } catch (error) {
      toast.error("戰鬥處理失敗");
      console.error("Combat error:", error);
    } finally {
      setIsAttacking(false);
    }
  };

  const handleTailRegrowthConfirm = () => {
    if (!pendingCombat) return;

    const newDecisions = {
      ...tailRegrowthDecisions,
      [currentTailType]: true,
    };
    setTailRegrowthDecisions(newDecisions);

    // Check if we need to show minion modal next
    if (
      currentTailType === "main" &&
      hasLionKingMinion(pendingCombat.attacker, pendingCombat.target)
    ) {
      setCurrentTailType("minion");
      // Keep modal open but switch to minion type
      return;
    }

    // All modals completed, proceed with combat
    setShowTailRegrowthModal(false);

    const message =
      currentTailType === "main"
        ? `${pendingCombat.target.nickname} 使用了斷尾求生`
        : `${pendingCombat.target.nickname} 使用了斷尾求生對抗手下攻擊`;

    toast.success(message);
    executeCombat(pendingCombat.attacker, pendingCombat.target, newDecisions);
  };

  const handleTailRegrowthCancel = () => {
    if (!pendingCombat) return;

    const newDecisions = {
      ...tailRegrowthDecisions,
      [currentTailType]: false,
    };
    setTailRegrowthDecisions(newDecisions);

    // Check if we need to show minion modal next
    if (
      currentTailType === "main" &&
      hasLionKingMinion(pendingCombat.attacker, pendingCombat.target)
    ) {
      setCurrentTailType("minion");
      // Keep modal open but switch to minion type
      return;
    }

    // All modals completed, proceed with combat
    setShowTailRegrowthModal(false);
    executeCombat(pendingCombat.attacker, pendingCombat.target, newDecisions);
  };

  const handleCombatResultConfirm = () => {
    setShowResultModal(false);
    setCombatResult(null);
    setOriginalAttacker(null);
    setOriginalTarget(null);
    handleReset();
  };

  const handlePass = async () => {
    if (!attacker || attacker.isDead) return;

    setIsPassing(true);
    try {
      const hasAlreadyPassed = attacker.isPassed;
      const shouldPunish = hasAlreadyPassed && !attacker.hasFought;

      const updatePayload: Partial<IPlayer> = {
        isPassed: true,
      };

      let toastMessage = `${attacker.nickname} 已跳過此回合`;

      // If player has already passed, apply damage penalty first
      if (shouldPunish && currentStage?.type === GAME_STAGE_TYPE.COMBAT) {
        const damage = currentStage.damage;
        const newHp = Math.max(0, attacker.hp - damage);
        updatePayload.isResting = true;
        updatePayload.hp = newHp;

        // Check if player dies from penalty
        if (newHp <= 0) {
          updatePayload.isDead = true;
        }

        toastMessage = `${attacker.nickname} 再次跳過並受到 ${damage} 點傷害懲罰`;
      } else if (hasAlreadyPassed && attacker.hasFought) {
        updatePayload.isResting = true;
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
          isDead: false,
          hasFought: false,
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

  return (
    <>
      <div className="space-y-6">
        {/* Player Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPlayers.map((player) => (
            <Button
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              disabled={isDisabled(player) || isAttacking}
              variant="outline"
              className={clsx(
                "flex justify-between items-center p-6 h-auto min-h-[80px] text-left hover:bg-muted/50 dark:hover:bg-muted/50",
                (isDisabled(player) || isAttacking) &&
                  "opacity-50 cursor-not-allowed",
                player.isDead &&
                  "opacity-60 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
                attacker?.id === player.id &&
                  !player.isDead &&
                  "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:ring-blue-400",
                target?.id === player.id &&
                  !player.isDead &&
                  "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 dark:ring-red-400",
              )}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div
                    className={clsx(
                      "font-semibold text-base",
                      player.isDead &&
                        "text-gray-500 dark:text-gray-400 line-through",
                    )}
                  >
                    {player.number} {player.nickname}
                  </div>
                  <div
                    className={clsx(
                      "text-sm text-muted-foreground",
                      player.isDead && "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    {getPlayerTypeLabel(player.type)} • 元素{" "}
                    {player.elementCount}
                  </div>

                  {(player.isResting ||
                    player.protected ||
                    player.isPassed ||
                    player.isDead) && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {player.isDead && (
                        <span className="text-xs bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded flex items-center gap-1">
                          <Skull className="h-3 w-3" />
                          已死亡
                        </span>
                      )}
                      {!player.isDead && player.isResting && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                          回合結束
                        </span>
                      )}
                      {!player.isDead && player.protected && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                          保護區
                        </span>
                      )}
                      {!player.isDead && player.isPassed && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                          已跳過
                        </span>
                      )}
                    </div>
                  )}

                  {/* Evolution Traits */}
                  {player.evolutionCards &&
                    player.evolutionCards.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {player.evolutionCards.map((trait, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={clsx(
                                "text-xs",
                                player.isDead && "opacity-50",
                              )}
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
                  <Heart
                    className={clsx(
                      "h-4 w-4",
                      player.isDead
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-red-500 dark:text-red-400",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-xl font-bold",
                      player.isDead && "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {player.hp}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {attacker?.id === player.id && !player.isDead && (
                    <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  )}
                  {target?.id === player.id && !player.isDead && (
                    <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Pass Action Section - Appears between grid and selection status when attacker is selected */}
        {attacker && !attacker.isDead && (
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
                  {attacker.isPassed && !attacker.hasFought ? (
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
                  disabled={isPassing || attacker.isDead || isAttacking}
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
                      {attacker.isPassed && !attacker.hasFought && (
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
                  {attacker.isDead && (
                    <span className="text-red-600 dark:text-red-400 ml-1">
                      已死亡
                    </span>
                  )}
                </span>
              </div>
            )}
            {target && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full"></div>
                <span>
                  目標：玩家 {target.number}（{target.nickname}）
                  {target.isDead && (
                    <span className="text-red-600 dark:text-red-400 ml-1">
                      已死亡
                    </span>
                  )}
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
              disabled={
                !attacker ||
                !target ||
                attacker.isDead ||
                target.isDead ||
                isAttacking
              }
              className="flex-1 min-h-[44px] text-sm"
              size="lg"
            >
              {isAttacking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>執行中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4" />
                  <span>執行攻擊</span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isAttacking}
              className="flex-1 sm:flex-none min-h-[44px] text-sm bg-transparent"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重新選擇
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={handleResetAllCombatState}
            disabled={isResetting || isAttacking}
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

      {/* Combat Result Modal */}
      <CombatResultModal
        isOpen={showResultModal}
        onClose={handleCombatResultConfirm}
        result={combatResult}
        originalAttacker={originalAttacker}
        originalTarget={originalTarget}
        allPlayers={allPlayers}
      />

      {/* Tail Regrowth Modal */}
      <TailRegrowthModal
        isOpen={showTailRegrowthModal}
        onConfirm={handleTailRegrowthConfirm}
        onCancel={handleTailRegrowthCancel}
        player={pendingCombat?.target || null}
        tailType={currentTailType}
      />
    </>
  );
};
