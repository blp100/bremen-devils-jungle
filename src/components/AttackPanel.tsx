import { IPlayer } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { getAttackResult } from "@/utils/attack";
import { useState } from "react";

type GameProps = {
  players: { [key: string]: IPlayer } | null;
};

export default function AttackPanel({ players }: GameProps) {
  const [loading, setLoading] = useState(false);

  const handleAttack = async () => {
    if (!players) return;

    setLoading(true);
    await getAttackResult(players[112627], players[114364], 4);
    setLoading(false);
  };

  return (
    <div>
      <h1>Attack Test</h1>
      <Button onClick={handleAttack} disabled={loading}>
        {loading ? "攻擊中..." : `攻擊 `}
      </Button>
    </div>
  );
}
