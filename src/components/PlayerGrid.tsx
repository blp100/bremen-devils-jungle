"use client";

import { PlayerCard } from "./PlayerCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import type { IPlayer } from "@/interfaces";

interface PlayerGridProps {
  players: IPlayer[];
  showDetailed?: boolean;
  title?: string;
  className?: string;
}

export const PlayerGrid = ({
  players,
  showDetailed = false,
  title = "玩家列表",
  className = "",
}: PlayerGridProps) => {
  const sortedPlayers = [...players].sort((a, b) => a.number - b.number);
  const alivePlayers = sortedPlayers.filter((p) => !p.isDead);
  const deadPlayers = sortedPlayers.filter((p) => p.isDead);

  return (
    <div className={`w-full max-w-screen-sm mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 px-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="ml-auto text-sm text-muted-foreground">
          {players.length} 位玩家
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-3 px-4 pb-4">
          {/* Alive Players */}
          {alivePlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              showDetailed={showDetailed}
            />
          ))}

          {/* Dead Players Section */}
          {deadPlayers.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-4 pb-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-background px-2">
                  已死亡玩家
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {deadPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  showDetailed={showDetailed}
                />
              ))}
            </>
          )}

          {/* Empty State */}
          {players.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>尚無玩家加入</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
