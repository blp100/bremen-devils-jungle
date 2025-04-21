import { processCombatPhase } from "@/utils/combatLogic";
import { updatePlayerStatusAfterAttack } from "@/services/updateData";
import { IPlayer, IGame } from "@/interfaces";

/**
 * Handles player attack.
 * This function is executed by the admin (game master).
 *
 * @param attacker
 * @param target
 * @param players
 * @param game
 */
export const handlePlayerAttack = async (
  attacker: IPlayer,
  target: IPlayer,
  players: { [key: string]: IPlayer },
  game: IGame,
) => {
  const result = processCombatPhase(attacker, target, players, game);

  if (result.success) {
    await updatePlayerStatusAfterAttack(result.attacker, result.target);
  }

  return result;
};
