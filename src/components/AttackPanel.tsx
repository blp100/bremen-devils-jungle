import { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { handlePlayerAttack } from "@/services/combatServices";

type GameProps = {
  players: { [key: string]: IPlayer } | null;
};

export default function AttackPanel({ players }: GameProps) {
  const handleAttack = async () => {
    if (!players) return;

    const result = await handlePlayerAttack(
      players[112627],
      players[114364],
      4,
    );
    console.log(result.reason);
  };

  return (
    <div>
      <h1>Attack Test</h1>
      <Button onClick={handleAttack}>攻擊</Button>
    </div>
  );
}
