import QRCode from "react-qr-code";

import { usePlayers } from "../../utils";

const Join = () => {
  const { data } = usePlayers();
  const players = data ?? {};
  const playerCount = Object.keys(players).length;

  return (
    <div>
      <h1>Join</h1>
      <pre>{`${playerCount} player(s) joined`}</pre>
      <pre>{JSON.stringify(players, null, 2)}</pre>
      <p>{window.location.origin + "/join"}</p>
      <QRCode value={window.location.origin + "/join"} />
    </div>
  );
};

export default Join;
