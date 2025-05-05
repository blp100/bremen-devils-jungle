"use client";

import { useState } from "react";
import { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface AdminCombatSelectorProps {
  players: IPlayer[];
  onAttack: (attacker: IPlayer, target: IPlayer) => void;
}

export const AdminCombatSelector = ({
  players,
  onAttack,
}: AdminCombatSelectorProps) => {
  const [attacker, setAttacker] = useState<IPlayer | null>(null);
  const [target, setTarget] = useState<IPlayer | null>(null);

  const handleSelectPlayer = (player: IPlayer) => {
    if (!attacker) {
      setAttacker(player);
    } else if (!target && player.id !== attacker.id) {
      setTarget(player);
    }
  };

  const handleReset = () => {
    setAttacker(null);
    setTarget(null);
  };

  const handleAttack = () => {
    if (attacker && target) {
      onAttack(attacker, target);
      handleReset();
    }
  };

  const isSelected = (player: IPlayer) => {
    return attacker?.id === player.id || target?.id === player.id;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <Button
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            variant="outline"
            className={clsx(
              "flex flex-col items-center justify-center py-6",
              attacker?.id === player.id && "ring-2 ring-blue-500",
              target?.id === player.id && "ring-2 ring-red-500",
              isSelected(player) && "font-bold",
            )}
          >
            {player.number} {player.nickname}
          </Button>
        ))}
      </div>

      <div className="text-sm text-center space-y-1">
        {attacker && (
          <div>
            攻擊者：玩家 {attacker.number}（{attacker.nickname}）
          </div>
        )}
        {target && (
          <div>
            目標：玩家 {target.number}（{target.nickname}）
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2">
        <Button onClick={handleAttack} disabled={!attacker || !target}>
          ⚔️ 執行攻擊
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          🔄 重新選擇
        </Button>
      </div>
    </div>
  );
};
