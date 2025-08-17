import { useGame } from "../../utils";

import { GAME_STATUS } from "../../constants";

import Join from "./Join";

const Home = () => {
  const { data: game } = useGame();

  return <>{game?.status === GAME_STATUS.JOINING && <Join />}</>;
};

export default Home;
