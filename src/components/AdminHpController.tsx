"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import type { IPlayer } from "@/interfaces";
import { updateData } from "@/services/firebaseHelpers";
import { ArrowLeft, Check, Heart } from "lucide-react";

interface AdminHpControllerProps {
  players: { [key: string]: IPlayer };
}

const PLAYER_TYPE_LABELS: Record<string, string> = {
  fire: "火",
  water: "水",
  wood: "木",
  electric: "電",
};

export const AdminHpController = ({ players }: AdminHpControllerProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const getPlayerTypeLabel = (type: string) => {
    return PLAYER_TYPE_LABELS[type] || type;
  };

  if (!selectedPlayerId) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">選擇要調整血量的玩家</h3>
          <p className="text-sm text-muted-foreground">
            點擊玩家來開始調整血量
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(players)
            .sort((a, b) => a.number - b.number)
            .map((player) => (
              <Button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                variant="outline"
                className="flex justify-between items-center p-6 h-auto min-h-[80px] text-left hover:bg-muted/50 dark:hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-semibold text-base">
                      {player.number} {player.nickname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getPlayerTypeLabel(player.type)} • 元素{" "}
                      {player.elementCount}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500 dark:text-red-400" />
                    <span className="text-2xl font-bold">{player.hp}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">血量</div>
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
  const [isUpdating, setIsUpdating] = useState(false);

  const updateHp = async () => {
    setIsUpdating(true);
    try {
      await updateData(`players/${player.id}`, { hp });
      toast.success(`${player.nickname} 的血量已更新為 ${hp}`);
      onBack();
    } catch (error) {
      toast.error("更新血量失敗");
    } finally {
      setIsUpdating(false);
    }
  };

  const adjustHp = (amount: number) => {
    setHp((prev) => Math.max(0, prev + amount));
  };

  return (
    <div className="space-y-6">
      {/* Player Info */}
      <div className="text-center bg-muted/30 dark:bg-muted/30 p-6 rounded-lg">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div>
            <div className="text-xl font-bold">
              {player.number} {player.nickname}
            </div>
            <div className="text-sm text-muted-foreground">
              {PLAYER_TYPE_LABELS[player.type]} • 元素 {player.elementCount}
            </div>
          </div>
        </div>
      </div>

      {/* Current HP Display */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500 dark:text-red-400" />
          <span className="text-4xl font-bold">{hp}</span>
        </div>
        <div className="text-sm text-muted-foreground">當前血量</div>
        {hp !== player.hp && (
          <div className="text-sm mt-1">
            <span className="text-muted-foreground">原本: {player.hp} → </span>
            <span
              className={
                hp > player.hp
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              變更: {hp > player.hp ? "+" : ""}
              {hp - player.hp}
            </span>
          </div>
        )}
      </div>

      {/* Quick Adjustment Buttons */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-center text-muted-foreground">
          快速調整
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => adjustHp(-5)}
            variant="destructive"
            className="min-h-[48px] text-base font-semibold"
            size="lg"
            disabled={hp <= 0}
          >
            -5
          </Button>
          <Button
            onClick={() => adjustHp(5)}
            className="min-h-[48px] text-base font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            size="lg"
          >
            +5
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => adjustHp(-1)}
            variant="outline"
            className="min-h-[44px] text-sm"
            size="lg"
            disabled={hp <= 0}
          >
            -1
          </Button>
          <Button
            onClick={() => adjustHp(1)}
            variant="outline"
            className="min-h-[44px] text-sm"
            size="lg"
          >
            +1
          </Button>
        </div>
      </div>

      {/* Manual Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium block text-center">
          手動輸入血量
        </label>
        <Input
          type="number"
          value={hp}
          onChange={(e) => setHp(Math.max(0, Number(e.target.value)))}
          className="text-center text-xl h-14 font-bold"
          min="0"
          placeholder="輸入血量值"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={updateHp}
          disabled={isUpdating || hp === player.hp}
          className="min-h-[48px] text-base font-semibold"
          size="lg"
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>更新中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>確認更新血量</span>
            </div>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onBack}
          className="min-h-[48px] text-base"
          size="lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回玩家列表
        </Button>
      </div>
    </div>
  );
};
