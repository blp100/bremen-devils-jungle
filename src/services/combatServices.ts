import { getAttackResult } from "@/utils/combatLogic";
import { updatePlayerStatusAfterAttack } from "@/services/updateData";
import { IPlayer } from "@/interfaces";

/**
 * Handles player attack.
 * This function is executed by the admin (game master).
 *
 * @param attacker
 * @param target
 * @param maxElementCount
 */
export const handlePlayerAttack = async (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
) => {
  const result = getAttackResult(attacker, target, maxElementCount);

  if (result.status) {
    await updatePlayerStatusAfterAttack(result.attacker, result.target);
  }

  return result;
};
