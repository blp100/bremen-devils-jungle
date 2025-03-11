import { IPlayer } from "@/interfaces";
import { PLAYER_TYPE } from "@/constants";

export const getAttackResult = (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
) => {
  // check for evolution cards
  // check base on elements
  return _canAttackBasedOnElement(attacker, target, maxElementCount);
  // return {attacker, target, result}
};

const FAILED_ATTACK_MAP = {
  [PLAYER_TYPE.FIRE]: PLAYER_TYPE.WATER,
  [PLAYER_TYPE.WATER]: PLAYER_TYPE.WOOD,
  [PLAYER_TYPE.WOOD]: PLAYER_TYPE.FIRE,
  [PLAYER_TYPE.ELECTRIC]: null, // electric can attack everyone
};

const _canAttackBasedOnElement = (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
) => {
  if (FAILED_ATTACK_MAP[attacker.type] === target.type) return false;

  if (attacker.type === target.type) {
    return _canAttackBasedOnElementCount(
      attacker.elementCount,
      target.elementCount,
      maxElementCount,
    );
  }

  return true;
};

const _canAttackBasedOnElementCount = (
  attackerElementCount: number,
  targetElementCount: number,
  maxElementCount: number,
) => {
  if ((attackerElementCount % maxElementCount) + 1 === targetElementCount) {
    return false;
  }
  return true;
};

// const _canAttackBasedOnEvolutionCards = (
//   attacker: IPlayer,
//   target: IPlayer,
// ) => {};
