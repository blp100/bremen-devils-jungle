"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import type { IPlayer } from "@/interfaces";
import { updateData } from "@/services/firebaseHelpers";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";

interface AdminHpControllerProps {
  players: { [key: string]: IPlayer };
}

export const AdminHpController = ({ players }: AdminHpControllerProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!selectedPlayerId) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground text-center mb-4">
          選擇要調整血量的玩家
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(players)
            .sort((a, b) => a.number - b.number)
            .map((player) => (
              <Button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                variant="outline"
                className="flex justify-between items-center p-4 h-auto min-h-[60px]"
              >
                <div className="text-left">
                  <div className="font-semibold text-base">
                    {player.number} {player.nickname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.type} • 元素 {player.elementCount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{player.hp}</div>
                  <div className="text-xs text-muted-foreground">HP</div>
                </div>
              </Button>
            ))}
        </div>
      </div>
    );
  }

  const player = players[selectedPlayerId];

  return (
    <PlayerHpEditor player={player} onBack={() => setSelectedPlayerId(null)} />
  );
};

const PlayerHpEditor = ({
  player,
  onBack,
}: {
  player: IPlayer;
  onBack: () => void;
}) => {
  const [hp, setHp] = useState(player.hp);

  const updateHp = async () => {
    await updateData(`players/${player.id}`, { hp });
    toast.success(`${player.nickname} 的 HP 已更新為 ${hp}`);
    onBack();
  };

  const adjustHp = (amount: number) => {
    setHp((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="space-y-6">
      {/* Player Info */}
      <div className="text-center bg-muted p-4 rounded-lg">
        <div className="text-lg font-bold">
          {player.number} {player.nickname}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {player.type} • 元素 {player.elementCount}
        </div>
      </div>

      {/* Current HP Display */}
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">{hp}</div>
        <div className="text-sm text-muted-foreground">當前血量</div>
      </div>

      {/* Quick Adjustment Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => adjustHp(-5)}
          variant="destructive"
          className="min-h-[48px] text-base"
          size="lg"
        >
          <Minus className="h-5 w-5 mr-1" />5
        </Button>
        <Button
          onClick={() => adjustHp(5)}
          variant="default"
          className="min-h-[48px] text-base bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-1" />5
        </Button>
        <Button
          onClick={() => adjustHp(-1)}
          variant="outline"
          className="min-h-[48px] text-base"
          size="lg"
        >
          <Minus className="h-5 w-5 mr-1" />1
        </Button>
        <Button
          onClick={() => adjustHp(1)}
          variant="outline"
          className="min-h-[48px] text-base"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-1" />1
        </Button>
      </div>

      {/* Manual Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium">手動輸入血量</label>
        <Input
          type="number"
          value={hp}
          onChange={(e) => setHp(Number(e.target.value))}
          className="text-center text-lg h-12"
          min="0"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={updateHp}
          className="flex-1 min-h-[48px] text-base"
          size="lg"
        >
          <Check className="h-5 w-5 mr-2" />
          更新血量
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 sm:flex-none min-h-[48px] text-base"
          size="lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回
        </Button>
      </div>
    </div>
  );
};
