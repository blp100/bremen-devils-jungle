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
import { CheckCircle, XCircle, Heart, ArrowRight, Skull } from "lucide-react";
import type { IPlayer, ITraitEffectLog } from "@/interfaces";
import { getTraitLabel } from "@/utils/traitHepler";

interface CombatResult {
  success: boolean;
  reason: string;
  attacker: IPlayer;
  target: IPlayer;
  damageDealt: number;
  traitsTriggered: ITraitEffectLog[];
}

interface CombatResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CombatResult | null;
  originalAttacker: IPlayer | null;
  originalTarget: IPlayer | null;
}

export const CombatResultModal = ({
  isOpen,
  onClose,
  result,
  originalAttacker,
  originalTarget,
}: CombatResultModalProps) => {
  if (!result || !originalAttacker || !originalTarget) return null;

  const attackerHpChange = result.attacker.hp - originalAttacker.hp;
  const targetHpChange = result.target.hp - originalTarget.hp;

  // Group traits by affected player
  const attackerTraits = result.traitsTriggered.filter(
    (effect) =>
      effect.targetId === originalAttacker.id ||
      effect.sourceId === originalAttacker.id,
  );
  const targetTraits = result.traitsTriggered.filter(
    (effect) =>
      effect.targetId === originalTarget.id ||
      effect.sourceId === originalTarget.id,
  );

  // Calculate trait effects for HP change display
  const getTraitEffectsSummary = (playerId: string, hpChange: number) => {
    const playerEffects = result.traitsTriggered.filter(
      (effect) => effect.targetId === playerId && effect.damage !== 0,
    );

    if (playerEffects.length === 0) return null;

    const totalTraitDamage = playerEffects.reduce(
      (sum, effect) => sum + effect.damage,
      0,
    );
    const baseDamage = hpChange + totalTraitDamage;

    if (totalTraitDamage === 0) return null;

    const traitNames = playerEffects
      .map((effect) => getTraitLabel(effect.trait))
      .join(", ");

    if (totalTraitDamage > 0) {
      return `(包含來自 ${traitNames} 的 +${totalTraitDamage} 傷害)`;
    } else {
      return `(包含來自 ${traitNames} 的 ${totalTraitDamage} 治療)`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[375px] mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">
                  攻擊成功
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">攻擊失敗</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Combat Summary */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {originalAttacker.number} {originalAttacker.nickname}
                </div>
                <div className="text-muted-foreground text-xs">攻擊者</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-right">
                <div className="font-medium">
                  {originalTarget.number} {originalTarget.nickname}
                </div>
                <div className="text-muted-foreground text-xs">目標</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-base font-bold">
                {result.success
                  ? `造成 ${result.damageDealt} 點傷害`
                  : `失去 ${result.damageDealt} 點血量`}
              </div>
            </div>
          </div>

          {/* HP Changes */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
              血量變化
            </h4>

            <div className="space-y-3">
              {/* Attacker HP */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  {originalAttacker.number} {originalAttacker.nickname}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-mono">
                    {originalAttacker.hp}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={`text-base font-mono font-bold ${
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
                    <Skull className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                {attackerHpChange !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    {attackerHpChange > 0
                      ? `獲得 ${attackerHpChange} HP`
                      : `失去 ${Math.abs(attackerHpChange)} HP`}
                    {getTraitEffectsSummary(
                      originalAttacker.id,
                      attackerHpChange,
                    ) && (
                      <div className="mt-1">
                        {getTraitEffectsSummary(
                          originalAttacker.id,
                          attackerHpChange,
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Attacker Traits */}
                {attackerTraits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                      觸發性狀：
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {attackerTraits.map((effect, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-blue-100 dark:bg-blue-900/60"
                        >
                          {getTraitLabel(effect.trait)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target HP */}
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                  {originalTarget.number} {originalTarget.nickname}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-mono">
                    {originalTarget.hp}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span
                    className={`text-base font-mono font-bold ${
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
                    <Skull className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                {targetHpChange !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    {targetHpChange > 0
                      ? `獲得 ${targetHpChange} HP`
                      : `失去 ${Math.abs(targetHpChange)} HP`}
                    {getTraitEffectsSummary(
                      originalTarget.id,
                      targetHpChange,
                    ) && (
                      <div className="mt-1">
                        {getTraitEffectsSummary(
                          originalTarget.id,
                          targetHpChange,
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Target Traits */}
                {targetTraits.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                    <div className="text-xs text-red-700 dark:text-red-300 mb-1">
                      觸發性狀：
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {targetTraits.map((effect, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-red-100 dark:bg-red-900/60"
                        >
                          {getTraitLabel(effect.trait)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Death Notifications */}
          {(result.attacker.isDead || result.target.isDead) && (
            <>
              <Separator />
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300 mb-2">
                  <Skull className="h-4 w-4" />
                  <span className="font-medium text-sm">玩家死亡</span>
                </div>
                <div className="space-y-1 text-xs">
                  {result.attacker.isDead && (
                    <div>
                      • {originalAttacker.number} {originalAttacker.nickname}{" "}
                      已死亡
                    </div>
                  )}
                  {result.target.isDead && (
                    <div>
                      • {originalTarget.number} {originalTarget.nickname} 已死亡
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full min-h-[44px]" size="lg">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
