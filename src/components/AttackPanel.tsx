import { IGame, IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { handlePlayerAttack } from "@/services/combatServices";

type GameProps = {
  game: IGame | null;
  players: { [key: string]: IPlayer } | null;
};

export default function AttackPanel({ players, game }: GameProps) {
  const handleAttack = async () => {
    if (!players || !game) return;

    const result = await handlePlayerAttack(
      players[243025],
      players[467238],
      players,
      game,
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
