import {
  createDummyPlayers,
  createGame,
  resetGame,
  useGame,
  usePlayers,
  useStartGame,
} from "../utils";
import { useData } from "../utils/firebaseHelpers";

import { GAME_STATUS } from "../constants";

const Admin = () => {
  const { data } = useData();
  const { data: game } = useGame();
  const { data: players } = usePlayers();

  const startGame = useStartGame();
  const playerCount = Object.values(players || {}).length;
  const hasEnoughPlayers = playerCount === 12;

  return (
    <div>
      <h1>Admin Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {(!game || game?.status === GAME_STATUS.ENDED) && (
        <button onClick={createGame}>Create new game</button>
      )}
      {game?.status === GAME_STATUS.JOINING && (
        <button disabled={!hasEnoughPlayers} onClick={startGame}>
          Start
        </button>
      )}
      {game?.status === GAME_STATUS.JOINING && (
        <button
          disabled={hasEnoughPlayers}
          onClick={() => createDummyPlayers(12 - playerCount)}
        >
          Create dummy players
        </button>
      )}
      <button onClick={resetGame}>Reset</button>
    </div>
  );
};

export default Admin;
