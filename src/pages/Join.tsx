"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JoinScreen } from "@/components/JoinScreen";
import { createPlayer, useGame } from "../utils";
import { GAME_STATUS } from "@/constants";

const Join = () => {
  const [isJoining, setIsJoining] = useState(false);
  const { data: game } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (game && game.status !== GAME_STATUS.JOINING) {
      navigate("/");
    }
  }, [game, isJoining, navigate]);

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

  if (isJoining || !game) return null;

  return <JoinScreen onJoin={handleJoin} isJoining={isJoining} />;
};

export default Join;
