import { useParams } from "react-router";

const Player = () => {
  let params = useParams();
  return <h1>Player Page {params.playerId} </h1>;
};

export default Player;
