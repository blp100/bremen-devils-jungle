"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, SkipForward, Skull, Crown, Bug } from "lucide-react";
import { getPlayerTypeLabel, getTraitLabel } from "@/utils/labelHelper";
import type { IPlayer } from "@/interfaces";
import { EVOLUTION_TRAITS } from "@/constants";

interface PlayerCardProps {
  player: IPlayer;
  showDetailed?: boolean;
  className?: string;
}

export const PlayerCard = ({
  player,
  showDetailed = false,
  className = "",
}: PlayerCardProps) => {
  const hpPercentage = Math.max(0, Math.min(100, (player.hp / 25) * 100));

  return (
    <Card
      className={`border-0 shadow-sm hover:shadow-md transition-shadow ${className} ${
        player.isDead ? "opacity-60 bg-gray-50 dark:bg-gray-900" : ""
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                player.isDead
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {player.number}
            </div>
            <div>
              <div
                className={`font-semibold text-base ${
                  player.isDead
                    ? "text-gray-500 dark:text-gray-400 line-through"
                    : ""
                }`}
              >
                {player.nickname}
              </div>
              <div
                className={`text-sm text-muted-foreground ${player.isDead ? "text-gray-400 dark:text-gray-500" : ""}`}
              >
                {getPlayerTypeLabel(player.type)} • 元素 {player.elementCount}
              </div>
            </div>
          </div>

          {/* Death Status */}
          {player.isDead && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Skull className="h-4 w-4" />
              <span className="text-xs font-medium">已死亡</span>
            </div>
          )}
        </div>

        {/* HP Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart
                className={`h-4 w-4 ${
                  player.isDead
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-red-500 dark:text-red-400"
                }`}
              />
              <span
                className={`text-sm font-medium ${player.isDead ? "text-gray-500 dark:text-gray-400" : ""}`}
              >
                血量
              </span>
            </div>
            <span
              className={`text-lg font-bold ${player.isDead ? "text-gray-500 dark:text-gray-400" : ""}`}
            >
              {player.hp}
            </span>
          </div>

          {/* HP Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                player.isDead
                  ? "bg-gray-400 dark:bg-gray-500"
                  : hpPercentage > 60
                    ? "bg-green-500"
                    : hpPercentage > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Badges */}
        {!player.isDead &&
          (player.isResting || player.protected || player.isPassed) && (
            <div className="flex flex-wrap gap-1">
              {player.isResting && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300"
                >
                  回合結束
                </Badge>
              )}
              {player.protected && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-300"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  保護區
                </Badge>
              )}
              {player.isPassed && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300"
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  已跳過
                </Badge>
              )}
            </div>
          )}

        {/* Evolution Traits */}
        {player.evolutionCards && player.evolutionCards.length > 0 && (
          <div className="space-y-2">
            <div
              className={`text-sm font-medium ${
                player.isDead
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-foreground"
              }`}
            >
              進化性狀
            </div>
            <div className="flex flex-wrap gap-1">
              {player.evolutionCards.map((trait, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs px-2 py-1 ${player.isDead ? "opacity-50" : ""}`}
                >
                  {getTraitLabel(trait as EVOLUTION_TRAITS)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Special Relationships */}
        {showDetailed && (player.minionId || player.parasiticTargetId) && (
          <div className="space-y-1 pt-2 border-t border-border">
            {player.minionId && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  player.isDead
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }`}
              >
                <Crown className="h-3 w-3" />
                <span>手下：玩家 {player.minionId}</span>
              </div>
            )}
            {player.parasiticTargetId && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  player.isDead
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-muted-foreground"
                }`}
              >
                <Bug className="h-3 w-3" />
                <span>寄生目標：玩家 {player.parasiticTargetId}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
