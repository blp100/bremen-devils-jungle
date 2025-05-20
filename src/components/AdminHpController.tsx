import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { IPlayer } from "@/interfaces";
import { updateData } from "@/services/firebaseHelpers";

interface AdminHpControllerProps {
  players: { [key: string]: IPlayer };
}

export const AdminHpController = ({ players }: AdminHpControllerProps) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!selectedPlayerId) {
    return (
      <div className="grid grid-cols-2 gap-2 p-4">
        {Object.values(players).map((player) => (
          <Button
            key={player.id}
            onClick={() => setSelectedPlayerId(player.id)}
          >
            {player.number} {player.nickname}
          </Button>
        ))}
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

  return (
    <div className="space-y-4 p-4">
      <div className="text-lg font-bold">
        {player.number} {player.nickname} 的 HP：{hp}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setHp((prev) => prev - 1)}>-1</Button>
        <Button onClick={() => setHp((prev) => prev + 1)}>+1</Button>
        <Input
          type="number"
          value={hp}
          onChange={(e) => setHp(Number(e.target.value))}
          className="w-24"
        />
        <Button onClick={updateHp}>✔️ 更新</Button>
      </div>
      <Button variant="outline" onClick={onBack}>
        ← 返回選擇其他玩家
      </Button>
    </div>
  );
};
