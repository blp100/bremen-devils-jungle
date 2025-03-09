import { useState } from "react";

import { createPlayer } from "../utils";

const Join = () => {
  const [nickname, setNickname] = useState("");
  const isValid = nickname.length > 0 && nickname.length <= 20;

  return (
    <div>
      <h1>Join Page</h1>
      <form>
        <input
          type="text"
          name="nickname"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button
          type="submit"
          disabled={!isValid}
          onClick={async (e) => {
            e.preventDefault();
            const playerId = await createPlayer(nickname);
            window.location.href = `/player/${playerId}`;
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Join;
