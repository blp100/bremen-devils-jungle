"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, SkipForward, Skull } from "lucide-react";
import { getPlayerTypeLabel, getTraitLabel } from "@/utils/labelHelper";
import type { IPlayer } from "@/interfaces";

interface PlayerCardProps {
  player: IPlayer;
  showDetailed?: boolean;
  className?: string;
}

export const PlayerCard = ({ player, className = "" }: PlayerCardProps) => {
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

        {/* HP Section - New Design */}
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
          </div>

          {/* HP Visual Display */}
          <div className="flex items-center justify-between">
            {/* Large HP Number */}
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl font-bold ${
                  player.isDead
                    ? "text-gray-400 dark:text-gray-500"
                    : player.hp <= 5
                      ? "text-red-600 dark:text-red-400"
                      : player.hp <= 12
                        ? "text-orange-500 dark:text-orange-400"
                        : "text-green-600 dark:text-green-400"
                }`}
              >
                {player.hp}
              </span>

              {/* Status Indicator */}
              <div>
                {player.isDead ? (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    已死亡
                  </span>
                ) : (
                  <span className="font-medium">HP</span>
                )}
              </div>
            </div>

            {/* Heart Icons Visual */}
            <div className="flex flex-wrap justify-end gap-0.5 max-w-[120px]">
              {Array.from(
                { length: Math.ceil(Math.max(player.hp, 1) / 5) },
                (_, i) => {
                  const heartsInGroup = Math.min(
                    5,
                    Math.max(0, player.hp - i * 5),
                  );
                  return (
                    <div key={i} className="flex">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Heart
                          key={j}
                          className={`h-2.5 w-2.5 ${
                            j < heartsInGroup
                              ? player.isDead
                                ? "text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600"
                                : player.hp <= 5
                                  ? "text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400"
                                  : player.hp <= 12
                                    ? "text-orange-400 dark:text-orange-300 fill-orange-400 dark:fill-orange-300"
                                    : "text-green-500 dark:text-green-400 fill-green-500 dark:fill-green-400"
                              : "text-gray-200 dark:text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                  );
                },
              )}
            </div>
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
                  {getTraitLabel(trait)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
