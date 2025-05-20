import { useState } from "react";
import { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";
import { handlePlayerAttack } from "@/services/combatServices";
import { IGame } from "@/interfaces";
import { GAME_STAGE_TYPE, GAME_STAGES } from "@/constants";

interface AdminCombatSelectorProps {
  players: IPlayer[];
  game: IGame;
  allPlayers: { [key: string]: IPlayer };
}

export const AdminCombatSelector = ({
  players,
  game,
  allPlayers,
}: AdminCombatSelectorProps) => {
  const [attacker, setAttacker] = useState<IPlayer | null>(null);
  const [target, setTarget] = useState<IPlayer | null>(null);

  const canBeAttacker = (player: IPlayer) => !player.isResting;
  const canBeTarget = (player: IPlayer) => !player.protected;
  const isDisabled = (player: IPlayer) => {
    if (!attacker) return !canBeAttacker(player);
    if (!target && player.id !== attacker.id) return !canBeTarget(player);
    return false;
  };
  const isCombatStage =
    GAME_STAGES[game.stageIndex]?.type === GAME_STAGE_TYPE.COMBAT;

  console.log(isCombatStage);

  const handleSelectPlayer = (player: IPlayer) => {
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
  };

  const handleAttack = async () => {
    if (attacker && target) {
      const result = await handlePlayerAttack(
        attacker,
        target,
        allPlayers,
        game,
      );

      if (result.success) {
        toast.success(
          `${attacker.nickname} 攻擊成功，對 ${target.nickname} 造成 ${result.damageDealt} 傷害`,
        );
      } else {
        toast.error(
          `${attacker.nickname} 攻擊失敗，損失 ${result.damageDealt} 血量，${target.nickname} 回復同等血量`,
        );
      }

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
            disabled={isDisabled(player)}
            variant="outline"
            className={clsx(
              "flex flex-col items-center justify-center py-6",
              isDisabled(player) && "opacity-50 cursor-not-allowed",
              attacker?.id === player.id && "ring-2 ring-blue-500",
              target?.id === player.id && "ring-2 ring-red-500",
              isSelected(player) && "font-bold",
            )}
          >
            <div>
              {player.number} {player.nickname}
              {player.isResting && (
                <span className="text-xs text-muted-foreground mt-1">
                  休息中
                </span>
              )}
              {player.protected && (
                <span className="text-xs text-muted-foreground mt-1">
                  保護區
                </span>
              )}
            </div>
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
        <Button
          onClick={handleAttack}
          disabled={!attacker || !target || !isCombatStage}
        >
          ⚔️ 執行攻擊
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          🔄 重新選擇
        </Button>
      </div>
    </div>
  );
};
