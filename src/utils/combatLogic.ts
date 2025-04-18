import { IPlayer } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

export const getAttackResult = (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
) => {
  const updatedAttacker = { ...attacker };
  const updatedTarget = { ...target };

  // Pre-combat trait effects
  applyBeforeCombatTraits(updatedAttacker, updatedTarget);

  // Check base on elements
  const elementBasedAttack = _canAttackBasedOnElement(
    attacker,
    target,
    maxElementCount,
  );
  // Check for evolution cards
  const evolutionBasedAttack = _canAttackBasedOnEvolutionCards(
    attacker,
    target,
  );

  const success = elementBasedAttack || evolutionBasedAttack;

  // TODO: Damage Test, remove later
  const damage = 3;

  if (success) {
    applyAfterCombatTraits(attacker, target, updatedAttacker, updatedTarget);

    updatedAttacker.hp += damage;
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

/**
 * Apply evolution trait effects that occur before the combat result is determined.
 * Example: SHARP_SPIKES — attacker takes damage before attacking.
 */
const applyBeforeCombatTraits = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  if (updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.SHARP_SPIKES)) {
    updatedAttacker.hp = Math.max(0, updatedAttacker.hp - 2);
  }

  // Future traits can go here...
};

const applyAfterCombatTraits = (
  attacker: IPlayer,
  target: IPlayer,
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  // BLOODTHIRSTY: attacker gains HP, target takes more damage
  if (attacker.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY)) {
    updatedAttacker.hp += 2;
    updatedTarget.hp = Math.max(0, updatedTarget.hp - 2);
  }

  // PARASITIC: if target survives, attacker gains 2 HP
  if (
    target.hp > 0 &&
    attacker.evolutionCards?.includes(EVOLUTION_TRAITS.PARASITIC)
  ) {
    updatedAttacker.hp += 2;
  }

  // DEADLY_POISON: if target dies, attacker also dies
  if (
    target.evolutionCards?.includes(EVOLUTION_TRAITS.DEADLY_POISON) &&
    updatedTarget.hp === 0
  ) {
    updatedAttacker.hp = 0;
  }

  // HIBERNATION: attacker becomes protected after successful attack
  if (attacker.evolutionCards?.includes(EVOLUTION_TRAITS.HIBERNATION)) {
    updatedAttacker.protected = true;
  }

  // TODO: Implement logic for other evolution traits if needed
};
