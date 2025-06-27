"use client";

import { useState } from "react";
import { JoinScreen } from "@/components/JoinScreen";
import { createPlayer } from "../utils";

const Join = () => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (nickname: string) => {
    setIsJoining(true);
    try {
      const playerId = await createPlayer(nickname);
      window.location.href = `/player/${playerId}`;
    } catch (error) {
      console.error("Failed to create player:", error);
      setIsJoining(false);
    }
  };

  return <JoinScreen onJoin={handleJoin} isJoining={isJoining} />;
};

export default Join;
