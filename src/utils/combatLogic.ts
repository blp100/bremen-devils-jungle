import { IPlayer } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

export const getAttackResult = (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
) => {
  const updatedAttacker = { ...attacker };
  const updatedTarget = { ...target };

  // check base on elements
  const elementBasedAttack = _canAttackBasedOnElement(
    attacker,
    target,
    maxElementCount,
  );
  // check for evolution cards
  const evolutionBasedAttack = _canAttackBasedOnEvolutionCards(
    attacker,
    target,
  );

  const success = elementBasedAttack || evolutionBasedAttack;

  // TODO: Damage Test, remove later
  const damage = 3;
  if (success) {
    updatedAttacker.hp += Math.max(damage);
    updatedTarget.hp = Math.max(0, target.hp - damage);
    updatedTarget.protected = true;
  }
  return {
    status: success,
    reason: success
      ? "Attack successful"
      : elementBasedAttack
        ? "Attack failed due to evolution traits"
        : "Attack failed due to element rules",
    attacker: updatedAttacker,
    target: updatedTarget,
  };
};

// element combat rules
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

const _canAttackBasedOnEvolutionCards = (
  attacker: IPlayer,
  target: IPlayer,
) => {
  if (
    attacker.evolutionCards?.includes(EVOLUTION_TRAITS.AMPHIBIOUS) &&
    attacker.type === target.type
  )
    return true;
  return false;
};
