import { updateData } from "@/services/firebaseHelpers";
import { IPlayer } from "@/interfaces";

/**
 * Update players' hp after combat
 * @param attacker
 * @param target
 */
export const updatePlayerStatusAfterAttack = async (players: {
  [key: string]: IPlayer;
}) => {
  await updateData("players", players);
};

/**
 * Updates the current game stage.
 * Includes round, type, damage, and other relevant data.
 *
 * @param stage - The game stage object to set as current
 */
export const updateGameStage = async (stage: any) => {
  await updateData("game", {
    currentStage: stage,
  });
};
