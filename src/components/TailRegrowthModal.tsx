"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Crown } from "lucide-react";
import type { IPlayer } from "@/interfaces";
import { getTraitLabel } from "@/utils/labelHelper";
import { EVOLUTION_TRAITS } from "@/constants";

interface TailRegrowthModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  player: IPlayer | null;
  tailType?: "main" | "minion";
}

export const TailRegrowthModal = ({
  isOpen,
  onConfirm,
  onCancel,
  player,
  tailType = "main",
}: TailRegrowthModalProps) => {
  if (!player) return null;

  const isMinion = tailType === "minion";

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-[375px] mx-0 max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            {isMinion ? (
              <>
                <Crown className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">
                  手下攻擊 - {getTraitLabel(EVOLUTION_TRAITS.TAIL_REGROWTH)}
                </span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700 dark:text-amber-300">
                  {getTraitLabel(EVOLUTION_TRAITS.TAIL_REGROWTH)}
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Tail Regrowth trait activation prompt
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 space-y-4">
          {/* Player Info */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {player.number}
              </div>
              <div>
                <div className="font-semibold text-sm">{player.nickname}</div>
                <div className="text-xs text-muted-foreground">
                  {isMinion ? "即將受到手下攻擊" : "即將受到攻擊"}
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="text-center py-4">
            <p className="font-medium text-base mb-2">使用斷尾求生？</p>
            <p className="text-sm text-muted-foreground">
              {isMinion
                ? "棄置 2 張攻擊卡來避免手下的攻擊傷害"
                : "棄置 2 張攻擊卡來保留血量"}
            </p>
          </div>

          {/* Info about attack type */}
          {isMinion && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 mb-1">
                <Crown className="h-3 w-3" />
                <span className="font-medium text-xs">獅子王手下攻擊</span>
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                這是獅子王性狀觸發的手下攻擊，你可以選擇是否使用斷尾求生來避免傷害
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-3 flex-shrink-0 flex-col gap-3">
          <Button
            onClick={onConfirm}
            className={`w-full min-h-[44px] ${
              isMinion
                ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
            }`}
            size="lg"
          >
            <div className="flex items-center gap-2">
              {isMinion ? (
                <Crown className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>是，使用斷尾求生</span>
            </div>
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full min-h-[44px] bg-transparent"
            size="lg"
          >
            否，承受傷害
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
