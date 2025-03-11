import { useGame } from "../../utils";

import { GAME_STATUS } from "../../constants";

import Join from "./Join";

const Home = () => {
  const { data: game } = useGame();

  return (
    <div>
      <h1>Home Page</h1>
      <pre>{JSON.stringify(game, null, 2)}</pre>
      {game?.status === GAME_STATUS.JOINING && <Join />}
    </div>
  );
};

export default Home;
