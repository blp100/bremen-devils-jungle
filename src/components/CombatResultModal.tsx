"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  XCircle,
  Heart,
  ArrowRight,
  Skull,
  Zap,
} from "lucide-react";
import type { IPlayer, ITraitEffectLog } from "@/interfaces";
import { getTraitLabel } from "@/utils/labelHelper";
import { EVOLUTION_TRAITS } from "@/constants";

interface CombatResult {
  success: boolean;
  reason: string;
  attacker: IPlayer;
  target: IPlayer;
  damageDealt: number;
  traitsTriggered: ITraitEffectLog[];
  players?: { [key: string]: IPlayer };
}

interface CombatResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CombatResult | null;
  originalAttacker: IPlayer | null;
  originalTarget: IPlayer | null;
  allPlayers?: { [key: string]: IPlayer };
}

export const CombatResultModal = ({
  isOpen,
  onClose,
  result,
  originalAttacker,
  originalTarget,
  allPlayers,
}: CombatResultModalProps) => {
  if (!result || !originalAttacker || !originalTarget) return null;

  const attackerHpChange = result.attacker.hp - originalAttacker.hp;
  const targetHpChange = result.target.hp - originalTarget.hp;

  // Get player info by ID
  const getPlayerInfo = (playerId: string) => {
    if (!allPlayers || !allPlayers[playerId]) {
      return { number: -1, nickname: "未知玩家" };
    }
    return {
      number: allPlayers[playerId].number,
      nickname: allPlayers[playerId].nickname,
    };
  };

  // Process all trait effects for the "Other Effects" section
  const processTraitEffects = () => {
    const effects: Array<{
      playerId: string;
      playerNumber: number;
      playerName: string;
      trait: string;
      hpChange: number;
      isSource: boolean;
    }> = [];

    console.log(result.traitsTriggered);

    result.traitsTriggered.forEach((effect) => {
      // For traits that affect the source player (trait holder)
      if (effect.sourceId && effect.damage !== 0) {
        const sourcePlayer = getPlayerInfo(effect.sourceId);
        const targetPlayer = getPlayerInfo(effect.targetId);

        // Special handling for Parasitic - the parasite (source) gains HP
        if (effect.trait === EVOLUTION_TRAITS.PARASITIC && effect.damage < 0) {
          effects.push({
            playerId: effect.sourceId,
            playerNumber: sourcePlayer.number,
            playerName: sourcePlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: Math.abs(effect.damage), // Convert negative damage to positive HP gain
            isSource: true,
          });
        }

        // Special handling for Bloodthirst
        if (effect.trait === EVOLUTION_TRAITS.BLOODTHIRSTY) {
          console.log(effect);
          effects.push({
            playerId: effect.sourceId,
            playerNumber: sourcePlayer.number,
            playerName: sourcePlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: effect.damage,
            isSource: true,
          });
          effects.push({
            playerId: effect.targetId,
            playerNumber: targetPlayer.number,
            playerName: targetPlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: -effect.damage,
            isSource: true,
          });
        }

        // For other traits where source takes damage (like Sharp Spikes)
        else if (effect.damage !== 0 && effect.sourceId !== effect.targetId) {
          effects.push({
            playerId: effect.sourceId,
            playerNumber: sourcePlayer.number,
            playerName: sourcePlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: -effect.damage, // Damage becomes negative HP change
            isSource: true,
          });
        }
      }

      // For traits that affect the target player
      if (effect.targetId && effect.damage !== 0) {
        const targetPlayer = getPlayerInfo(effect.targetId);

        // Skip if this is the main combat participants (already shown above)
        if (
          effect.targetId === originalAttacker.id ||
          effect.targetId === originalTarget.id
        ) {
          return;
        }

        // For traits like Scavenger where target gains HP (negative damage)
        if (effect.damage < 0) {
          effects.push({
            playerId: effect.targetId,
            playerNumber: targetPlayer.number,
            playerName: targetPlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: Math.abs(effect.damage), // Convert negative damage to positive HP gain
            isSource: false,
          });
        }
        // For traits where target takes damage
        else if (effect.damage > 0) {
          effects.push({
            playerId: effect.targetId,
            playerNumber: targetPlayer.number,
            playerName: targetPlayer.nickname,
            trait: getTraitLabel(effect.trait),
            hpChange: -effect.damage, // Damage becomes negative HP change
            isSource: false,
          });
        }
      }
    });

    // Remove duplicates and sort by player number
    const uniqueEffects = effects.filter(
      (effect, index, self) =>
        index ===
        self.findIndex(
          (e) =>
            e.playerId === effect.playerId &&
            e.trait === effect.trait &&
            e.hpChange === effect.hpChange,
        ),
    );

    return uniqueEffects.sort((a, b) => a.playerNumber - b.playerNumber);
  };

  const otherEffects = processTraitEffects();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[375px] mx-0 max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            {result.success ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">
                  攻擊成功
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">攻擊失敗</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-3 pb-4">
            {/* Compact Combat Summary */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">
                  {originalAttacker.number} {originalAttacker.nickname}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">
                  {originalTarget.number} {originalTarget.nickname}
                </span>
              </div>
              <div className="text-center text-sm font-semibold">
                {result.success
                  ? `造成 ${result.damageDealt} 點傷害`
                  : `失去 ${result.damageDealt} 點血量`}
              </div>
            </div>

            {/* Compact HP Changes */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Heart className="h-3 w-3 text-red-500 dark:text-red-400" />
                血量變化
              </h4>

              {/* Attacker HP - Compact */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    {originalAttacker.number} {originalAttacker.nickname}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{originalAttacker.hp}</span>
                    <ArrowRight className="h-2 w-2 text-muted-foreground" />
                    <span
                      className={`font-mono font-bold ${
                        result.attacker.isDead
                          ? "text-red-600 dark:text-red-400"
                          : attackerHpChange > 0
                            ? "text-green-600 dark:text-green-400"
                            : attackerHpChange < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                      }`}
                    >
                      {result.attacker.hp}
                    </span>
                    {result.attacker.isDead && (
                      <Skull className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                {attackerHpChange !== 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {attackerHpChange > 0
                      ? `+${attackerHpChange}`
                      : `${attackerHpChange}`}{" "}
                    HP
                  </div>
                )}
              </div>

              {/* Target HP - Compact */}
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-red-800 dark:text-red-300">
                    {originalTarget.number} {originalTarget.nickname}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{originalTarget.hp}</span>
                    <ArrowRight className="h-2 w-2 text-muted-foreground" />
                    <span
                      className={`font-mono font-bold ${
                        result.target.isDead
                          ? "text-red-600 dark:text-red-400"
                          : targetHpChange > 0
                            ? "text-green-600 dark:text-green-400"
                            : targetHpChange < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                      }`}
                    >
                      {result.target.hp}
                    </span>
                    {result.target.isDead && (
                      <Skull className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                {targetHpChange !== 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {targetHpChange > 0
                      ? `+${targetHpChange}`
                      : `${targetHpChange}`}{" "}
                    HP
                  </div>
                )}
              </div>
            </div>

            {/* Other Effects Section */}
            {otherEffects.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                    其他效果
                  </h4>

                  <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded border border-gray-200 dark:border-gray-700">
                    <div className="space-y-1">
                      {otherEffects.map((effect, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {effect.playerNumber} {effect.playerName}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs px-1 py-0"
                            >
                              {effect.trait}
                            </Badge>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              effect.hpChange > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {effect.hpChange > 0
                              ? `+${effect.hpChange}`
                              : `${effect.hpChange}`}{" "}
                            HP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Death Notifications - Compact */}
            {(result.attacker.isDead || result.target.isDead) && (
              <>
                <Separator />
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-1">
                    <Skull className="h-3 w-3" />
                    <span className="font-medium text-xs">玩家死亡</span>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    {result.attacker.isDead && (
                      <div>
                        • {originalAttacker.number} {originalAttacker.nickname}
                      </div>
                    )}
                    {result.target.isDead && (
                      <div>
                        • {originalTarget.number} {originalTarget.nickname}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-3 flex-shrink-0">
          <Button onClick={onClose} className="w-full min-h-[44px]" size="lg">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
