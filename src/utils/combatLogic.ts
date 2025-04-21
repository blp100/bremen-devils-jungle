import { IPlayer, IGame } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

export const processCombatPhase = (
  attacker: IPlayer,
  target: IPlayer,
  allPlayers: { [key: string]: IPlayer },
  game: IGame,
) => {
  // Prevent attacking your own minion if you are LION_KING
  if (
    attacker.evolutionCards?.includes(EVOLUTION_TRAITS.LION_KING) &&
    attacker.minionId === target.id
  ) {
    return {
      success: false,
      reason: "You cannot attack your own minion.",
      attacker,
      target,
      damageDealt: 0,
      players: allPlayers,
    };
  }

  // Main combat resolution
  const result = resolveDirectCombat(
    attacker,
    target,
    game.maxElementCount,
    game.damage,
  );

  // Reactive traits
  if (result.success) {
    for (const playerId in allPlayers) {
      const player = allPlayers[playerId];
      // PARASITIC
      if (
        player.evolutionCards?.includes(EVOLUTION_TRAITS.PARASITIC) &&
        player.id !== attacker.id &&
        player.parasiticTargetId === attacker.id
      ) {
        player.hp += result.damageDealt;
      }

      // LION_KING: trigger minion follow-up attack
      if (
        attacker.evolutionCards?.includes(EVOLUTION_TRAITS.LION_KING) &&
        attacker.minionId === player.id &&
        player.id !== target.id
      ) {
        const minionResult = resolveDirectCombat(
          player,
          target,
          game.maxElementCount,
          game.damage,
        );
        result.damageDealt += minionResult.damageDealt;
        result.target = minionResult.target; // Update target state after minion attack
      }
    }
  }

  return {
    ...result,
    players: allPlayers,
  };
};

const resolveDirectCombat = (
  attacker: IPlayer,
  target: IPlayer,
  maxElementCount: number,
  damage: number,
) => {
  const updatedAttacker = { ...attacker };
  const updatedTarget = { ...target };

  applyPreOutcomeEffects(updatedAttacker, updatedTarget);

  const elementValid = _canAttackBasedOnElement(
    attacker,
    target,
    maxElementCount,
  );
  const evolutionValid = _canAttackBasedOnEvolutionCards(attacker, target);

  const success = elementValid || evolutionValid;

  if (success) {
    updatedAttacker.hp += damage;
    updatedTarget.hp = Math.max(0, updatedTarget.hp - damage);
    updatedTarget.protected = true;

    applyAfterCombatEffects(updatedAttacker, updatedTarget);
  }

  return {
    success,
    attacker: updatedAttacker,
    target: updatedTarget,
    damageDealt: success ? damage : 0,
    reason: success ? "Attack succeeded" : "Attack failed",
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
const applyPreOutcomeEffects = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  if (updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.SHARP_SPIKES)) {
    updatedAttacker.hp = Math.max(0, updatedAttacker.hp - 2);
  }

  // Future traits can go here...
};

const applyAfterCombatEffects = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  // BLOODTHIRSTY: attacker gains HP, target takes more damage
  if (
    updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY) ||
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY)
  ) {
    updatedAttacker.hp += 2;
    updatedTarget.hp = Math.max(0, updatedTarget.hp - 2);
  }

  // DEADLY_POISON: if target dies, attacker also dies
  if (
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.DEADLY_POISON) &&
    updatedTarget.hp === 0
  ) {
    updatedAttacker.hp = 0;
  }

  // HIBERNATION: attacker becomes protected after successful attack
  if (updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.HIBERNATION)) {
    updatedAttacker.protected = true;
  }

  // Future traits can go here...
};
