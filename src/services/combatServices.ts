import { processCombatPhase } from "@/utils/combatLogic";
import { updatePlayerStatusAfterAttack } from "@/services/updateData";
import { updateData } from "@/services/firebaseHelpers";
import { DB_PATH } from "@/constants";
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

  await updatePlayerStatusAfterAttack(players);

  const logEntry = {
    timestamp: new Date().toISOString(),
    attackerId: attacker.id,
    targetId: target.id,
    success: result.success,
    damage: result.damageDealt,
  };

  const logKey = `combat-${Date.now()}`;
  await updateData(`${DB_PATH.COMBAT_LOGS}/${logKey}`, logEntry);

  if (result.traitsTriggered && result.traitsTriggered.length > 0) {
    for (const effect of result.traitsTriggered) {
      const traitLogEntry = {
        timestamp: new Date().toISOString(),
        type: "trait-effect",
        trait: effect.trait,
        sourceId: effect.sourceId,
        targetId: effect.targetId,
        damage: effect.damage,
        note: effect.note,
      };
      const traitLogKey = `trait-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await updateData(`${DB_PATH.COMBAT_LOGS}/${traitLogKey}`, traitLogEntry);
    }
  }

  return result;
};
