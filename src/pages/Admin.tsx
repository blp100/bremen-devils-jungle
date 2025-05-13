import {
  createDummyPlayers,
  createGame,
  resetGame,
  useGame,
  usePlayers,
  useStartGame,
} from "../utils";
import { useData } from "../services/firebaseHelpers";

import { GAME_STATUS, PLAYER_COUNT } from "../constants";
import AttackPanel from "@/components/AttackPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AdminCombatSelector } from "@/components/AdminCombatSelector";
import { AdminStageController } from "@/components/AdminStageController";
import { handlePlayerAttack } from "@/services/combatServices";

const Admin = () => {
  const { data } = useData();
  const { data: game } = useGame();
  const { data: players } = usePlayers();

  const startGame = useStartGame();
  const playerCount = Object.values(players || {}).length;
  const hasEnoughPlayers = playerCount >= PLAYER_COUNT.MIN;
  const hasReachedMaxPlayers = playerCount >= PLAYER_COUNT.MAX;

  return (
    <div>
      <h1>Admin Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {(!game || game?.status === GAME_STATUS.ENDED) && (
        <Button onClick={createGame}>Create new game</Button>
      )}
      {game?.status === GAME_STATUS.JOINING && (
        <Button disabled={!hasEnoughPlayers} onClick={startGame}>
          Start
        </Button>
      )}
      {game?.status === GAME_STATUS.JOINING && (
        <Button
          disabled={hasReachedMaxPlayers}
          onClick={() => createDummyPlayers(10, playerCount)}
        >
          Create 10 dummy players
        </Button>
      )}
      {game?.status === GAME_STATUS.JOINING && (
        <Button
          disabled={hasReachedMaxPlayers}
          onClick={() => createDummyPlayers(1, playerCount)}
        >
          Create 1 dummy player
        </Button>
      )}
      <Button onClick={resetGame}>Reset</Button>
      <AttackPanel game={game} players={players} />
      {players && game && (
        <AdminCombatSelector
          players={Object.values(players)}
          onAttack={async (attacker, target) => {
            const result = await handlePlayerAttack(
              attacker,
              target,
              players,
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
          }}
        />
      )}
      <AdminStageController />
    </div>
  );
};

export default Admin;
