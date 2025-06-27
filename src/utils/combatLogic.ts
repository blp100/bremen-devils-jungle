import { IPlayer, IGame, ITraitEffectLog } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

const BLOODTHIRSTY_ADDITIONAL_AMOUNT = 2;
const LION_KING_HEAL_AMOUNT = 3;

const updateDeathStatus = (player: IPlayer) => {
  if (player.hp <= 0) {
    player.hp = 0;
    player.isDead = true;
  }
};

/** Trait trigger handlers */
const triggerParasiticTrait = (
  allPlayers: { [key: string]: IPlayer },
  previousHp: Record<string, number>,
  traitsTriggered: ITraitEffectLog[],
) => {
  for (const parasiteId in allPlayers) {
    const parasite = allPlayers[parasiteId];
    const hostId = parasite.parasiticTargetId ?? "";

    if (
      parasite.evolutionCards?.includes(EVOLUTION_TRAITS.PARASITIC) &&
      hostId &&
      allPlayers[hostId]
    ) {
      const hpBefore = previousHp[hostId] ?? 0;
      const hpAfter = allPlayers[hostId].hp;
      const diff = hpAfter - hpBefore;

      if (diff > 0) {
        parasite.hp += diff;
        traitsTriggered.push({
          trait: EVOLUTION_TRAITS.PARASITIC,
          sourceId: parasite.id,
          targetId: hostId,
          damage: -diff,
        });
      }
    }
  }
};

const triggerSharpSpikesTrait = (attacker: IPlayer, target: IPlayer): void => {
  if (target.evolutionCards?.includes(EVOLUTION_TRAITS.SHARP_SPIKES)) {
    attacker.hp = Math.max(0, attacker.hp - 2);
  }
};

const triggerBloodthirstyTrait = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
  success: boolean,
  traitsTriggered: ITraitEffectLog[],
): void => {
  if (
    updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY) ||
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY)
  ) {
    const victor = success ? updatedAttacker : updatedTarget;
    const loser = success ? updatedTarget : updatedAttacker;

    victor.hp += BLOODTHIRSTY_ADDITIONAL_AMOUNT;
    loser.hp = Math.max(0, loser.hp - BLOODTHIRSTY_ADDITIONAL_AMOUNT);

    traitsTriggered.push({
      trait: EVOLUTION_TRAITS.BLOODTHIRSTY,
      sourceId: victor.id,
      targetId: loser.id,
      damage: BLOODTHIRSTY_ADDITIONAL_AMOUNT,
    });
  }
};

const triggerDeadlyPoisonTrait = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
  traitsTriggered: ITraitEffectLog[],
): void => {
  if (
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.DEADLY_POISON) &&
    updatedTarget.hp === 0
  ) {
    updatedAttacker.hp = 0;
    updateDeathStatus(updatedAttacker);

    traitsTriggered.push({
      trait: EVOLUTION_TRAITS.DEADLY_POISON,
      sourceId: updatedTarget.id,
      targetId: updatedAttacker.id,
      damage: updatedAttacker.hp,
    });
  }
};

const triggerHibernationTrait = (updatedAttacker: IPlayer): void => {
  if (updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.HIBERNATION)) {
    updatedAttacker.protected = true;
  }
};

const triggerScavengerTrait = (
  allPlayers: { [key: string]: IPlayer },
  traitsTriggered: ITraitEffectLog[],
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
): void => {
  const someoneDied = updatedAttacker.hp === 0 || updatedTarget.hp === 0;

  for (const playerId in allPlayers) {
    const player = allPlayers[playerId];
    if (
      player.evolutionCards?.includes(EVOLUTION_TRAITS.SCAVENGER) &&
      player.hp > 0 &&
      someoneDied
    ) {
      player.hp += 4;

      traitsTriggered.push({
        trait: EVOLUTION_TRAITS.SCAVENGER,
        sourceId: player.id,
        targetId:
          updatedAttacker.hp === 0 ? updatedAttacker.id : updatedTarget.id,
        damage: -4,
      });
    }
  }
};

const triggerLionKingTrait = (
  attacker: IPlayer,
  target: IPlayer,
  allPlayers: { [key: string]: IPlayer },
  game: IGame,
  traitsTriggered: ITraitEffectLog[],
): IPlayer => {
  let updatedTarget = { ...target };

  for (const playerId in allPlayers) {
    const minion = allPlayers[playerId];

    if (
      attacker.evolutionCards?.includes(EVOLUTION_TRAITS.LION_KING) &&
      attacker.minionId === minion.id &&
      minion.id !== target.id &&
      !minion.isDead
    ) {
      const minionCombatResult = resolveDirectCombat(
        minion,
        target,
        game.maxElementCount,
        game.damage,
        allPlayers,
        game,
      );

      if (minionCombatResult.success) {
        const minionHpGain =
          -minionCombatResult.damageDealt + LION_KING_HEAL_AMOUNT;
        allPlayers[attacker.id].hp += LION_KING_HEAL_AMOUNT;
        updatedTarget = { ...minionCombatResult.target };
        allPlayers[minionCombatResult.attacker.id] = {
          ...minionCombatResult.attacker,
          hp: Math.max(
            0,
            minionCombatResult.attacker.hp - LION_KING_HEAL_AMOUNT,
          ),
          isResting: false,
        };

        traitsTriggered.push({
          trait: EVOLUTION_TRAITS.LION_KING,
          sourceId: attacker.id,
          targetId: updatedTarget.id,
          damage: -LION_KING_HEAL_AMOUNT,
        });

        traitsTriggered.push({
          trait: EVOLUTION_TRAITS.LION_KING,
          sourceId: minionCombatResult.attacker.id,
          targetId: updatedTarget.id,
          damage: minionHpGain,
        });
      } else {
        traitsTriggered.push({
          trait: EVOLUTION_TRAITS.LION_KING,
          sourceId: minionCombatResult.attacker.id,
          targetId: updatedTarget.id,
          damage: minionCombatResult.damageDealt,
        });
      }
      traitsTriggered.push(...minionCombatResult.traitsTriggered);

      applyPostCombatTraitEffects(
        allPlayers,
        traitsTriggered,
        minionCombatResult.attacker,
        minionCombatResult.target,
      );

      // Ensure updatedTarget is synced into allPlayers

      allPlayers[attacker.id] = { ...attacker };
      allPlayers[minionCombatResult.attacker.id] = {
        ...minionCombatResult.attacker,
      };
      allPlayers[minionCombatResult.target.id] = {
        ...minionCombatResult.target,
      };
    }
  }

  return updatedTarget;
};

const applyPostCombatTraitEffects = (
  allPlayers: { [key: string]: IPlayer },
  traitsTriggered: ITraitEffectLog[],
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  triggerScavengerTrait(
    allPlayers,
    traitsTriggered,
    updatedAttacker,
    updatedTarget,
  );
};

/**
 * Apply evolution trait effects that occur before the combat result is determined.
 * Example: SHARP_SPIKES — attacker takes damage before attacking.
 */
const applyPreOutcomeEffects = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  triggerSharpSpikesTrait(updatedAttacker, updatedTarget);
};

/**
 * Apply evolution trait effects that occur after combat.
 */
const applyAfterCombatEffects = (
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
  success: boolean,
  traitsTriggered: ITraitEffectLog[],
  _allPlayers: { [key: string]: IPlayer },
) => {
  triggerBloodthirstyTrait(
    updatedAttacker,
    updatedTarget,
    success,
    traitsTriggered,
  );
  triggerDeadlyPoisonTrait(updatedAttacker, updatedTarget, traitsTriggered);
  triggerHibernationTrait(updatedAttacker);
};

export const processCombatPhase = (
  attacker: IPlayer,
  target: IPlayer,
  allPlayers: { [key: string]: IPlayer },
  game: IGame,
): {
  success: boolean;
  reason: string;
  attacker: IPlayer;
  target: IPlayer;
  damageDealt: number;
  players: { [key: string]: IPlayer };
  traitsTriggered: ITraitEffectLog[];
} => {
  // Record all players' hp at begging of combat
  const previousHp: Record<string, number> = {};
  Object.keys(allPlayers).forEach((id) => {
    previousHp[id] = allPlayers[id].hp;
  });

  // Prevent attacking dead players or attacking as a dead player
  if (attacker.isDead) {
    return {
      success: false,
      reason: "Dead players cannot attack.",
      attacker,
      target,
      damageDealt: 0,
      players: allPlayers,
      traitsTriggered: [],
    };
  }

  if (target.isDead) {
    return {
      success: false,
      reason: "Cannot attack dead players.",
      attacker,
      target,
      damageDealt: 0,
      players: allPlayers,
      traitsTriggered: [],
    };
  }

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
      traitsTriggered: [],
    };
  }

  // Main combat resolution;
  const result = resolveDirectCombat(
    attacker,
    target,
    game.maxElementCount,
    game.damage,
    allPlayers,
    game,
  );

  // Reactive traits
  const updatedTarget = triggerLionKingTrait(
    attacker,
    result.target,
    allPlayers,
    game,
    result.traitsTriggered,
  );
  result.target = { ...updatedTarget };

  applyPostCombatTraitEffects(
    allPlayers,
    result.traitsTriggered,
    result.attacker,
    result.target,
  );

  // update attacker and target infomation
  allPlayers[result.attacker.id] = {
    ...allPlayers[result.attacker.id],
    ...result.attacker,
  };

  allPlayers[result.target.id] = {
    ...allPlayers[result.target.id],
    ...result.target,
  };

  triggerParasiticTrait(allPlayers, previousHp, result.traitsTriggered);

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
  allPlayers: { [key: string]: IPlayer },
  game: IGame,
) => {
  const playerCount = Object.keys(allPlayers).length;
  const updatedAttacker = { ...attacker };
  const updatedTarget = { ...target };

  const traitsTriggered: ITraitEffectLog[] = [];

  applyPreOutcomeEffects(updatedAttacker, updatedTarget);

  const elementValid = _canAttackBasedOnElement(
    attacker,
    target,
    maxElementCount,
    playerCount,
  );
  const evolutionValid = _canAttackBasedOnEvolutionCards(attacker, target);

  updatedAttacker.hasFought = true;
  updatedTarget.hasFought = true;

  const success = (elementValid || evolutionValid) && !updatedTarget.protected;

  if (success) {
    updatedAttacker.hp += damage;
    updatedAttacker.isResting = true;

    updatedAttacker.hasFought = true;
    updatedTarget.hasFought = true;

    updatedTarget.hp = Math.max(0, updatedTarget.hp - damage);
    updatedTarget.protected = game.round === undefined || game.round <= 3;

    updateDeathStatus(updatedTarget);

    applyAfterCombatEffects(
      updatedAttacker,
      updatedTarget,
      success,
      traitsTriggered,
      allPlayers,
    );
  } else {
    updatedAttacker.hp = Math.max(0, updatedAttacker.hp - damage);
    updateDeathStatus(updatedAttacker);

    updatedTarget.hp += damage;

    applyAfterCombatEffects(
      updatedAttacker,
      updatedTarget,
      success,
      traitsTriggered,
      allPlayers,
    );
  }

  return {
    success,
    attacker: updatedAttacker,
    target: updatedTarget,
    damageDealt: damage,
    reason: success ? "Attack succeeded" : "Attack failed",
    traitsTriggered,
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
  playerCount: number,
) => {
  if (FAILED_ATTACK_MAP[attacker.type] === target.type) return false;

  if (attacker.type === target.type) {
    return _canAttackBasedOnElementCount(
      attacker.elementCount,
      target.elementCount,
      maxElementCount,
      playerCount,
    );
  }

  return true;
};

const _canAttackBasedOnElementCount = (
  attackerElementCount: number,
  targetElementCount: number,
  maxElementCount: number,
  playerCount?: number,
) => {
  if (playerCount === 12) {
    return (attackerElementCount % maxElementCount) + 1 !== targetElementCount;
  } else {
    return attackerElementCount - 1 === targetElementCount % maxElementCount;
  }
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
