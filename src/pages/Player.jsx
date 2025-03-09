import { useParams } from "react-router";

import { usePlayer } from "../utils";

const Player = () => {
  let params = useParams();
  const { data } = usePlayer(params.playerId);

  return (
    <div>
      <h1>Player Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Player;
