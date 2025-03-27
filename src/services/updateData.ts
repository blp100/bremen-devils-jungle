import { updateData } from "@/services/firebaseHelpers";
import { IPlayer } from "@/interfaces";

/**
 * update players' hp after combat
 * @param attacker
 * @param target
 */
export const updatePlayerStatusAfterAttack = async (
  attacker: IPlayer,
  target: IPlayer,
) => {
  await updateData("players", {
    [attacker.id]: attacker,
    [target.id]: target,
  });
};
