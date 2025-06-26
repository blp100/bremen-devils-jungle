import { IPlayer, IGame, ITraitEffectLog } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

const updateDeathStatus = (player: IPlayer) => {
  if (player.hp <= 0) {
    player.hp = 0;
    player.isDead = true;
  }
};

/** Trait trigger handlers */

const triggerParasiticTrait = (
  host: IPlayer,
  hpGained: number,
  allPlayers: { [key: string]: IPlayer },
  traitsTriggered: ITraitEffectLog[],
) => {
  for (const parasiteId in allPlayers) {
    const parasite = allPlayers[parasiteId];
    if (
      parasite.evolutionCards?.includes(EVOLUTION_TRAITS.PARASITIC) &&
      parasite.parasiticTargetId === host.id
    ) {
      parasite.hp += hpGained;

      traitsTriggered.push({
        trait: EVOLUTION_TRAITS.PARASITIC,
        sourceId: parasite.id,
        targetId: host.id,
        damage: -hpGained,
      });
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
  allPlayers: { [key: string]: IPlayer },
): void => {
  if (
    updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY) ||
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY)
  ) {
    const victor = success ? updatedAttacker : updatedTarget;
    const loser = success ? updatedTarget : updatedAttacker;

    victor.hp += 2;
    triggerParasiticTrait(victor, 2, allPlayers, traitsTriggered);
    loser.hp = Math.max(0, loser.hp - 2);

    traitsTriggered.push(
      {
        trait: EVOLUTION_TRAITS.BLOODTHIRSTY,
        sourceId: victor.id,
        targetId: victor.id,
        damage: -2,
      },
      {
        trait: EVOLUTION_TRAITS.BLOODTHIRSTY,
        sourceId: victor.id,
        targetId: loser.id,
        damage: 2,
      },
    );
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

      triggerParasiticTrait(player, 4, allPlayers, traitsTriggered);

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
): { updatedTarget: IPlayer } => {
  let updatedTarget = target;

  for (const playerId in allPlayers) {
    const player = allPlayers[playerId];

    if (
      attacker.evolutionCards?.includes(EVOLUTION_TRAITS.LION_KING) &&
      attacker.minionId === player.id &&
      player.id !== target.id &&
      !player.isDead
    ) {
      const minionResult = resolveDirectCombat(
        player,
        target,
        game.maxElementCount,
        game.damage,
        allPlayers,
        game,
      );

      attacker.hp += 3;
      updatedTarget = minionResult.target;
      minionResult.attacker.hp = Math.max(0, minionResult.attacker.hp - 3);

      allPlayers[minionResult.attacker.id] = { ...minionResult.attacker };
      traitsTriggered.push(...minionResult.traitsTriggered);

      triggerParasiticTrait(attacker, 3, allPlayers, traitsTriggered);
      applyPostCombatTraitEffects(
        allPlayers,
        traitsTriggered,
        minionResult.attacker,
        minionResult.target,
      );
    }
  }

  return { updatedTarget };
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
  allPlayers: { [key: string]: IPlayer },
) => {
  triggerBloodthirstyTrait(
    updatedAttacker,
    updatedTarget,
    success,
    traitsTriggered,
    allPlayers,
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
  if (result.success) {
    const lionKingResult = triggerLionKingTrait(
      attacker,
      result.target,
      allPlayers,
      game,
      result.traitsTriggered,
    );
    result.target = lionKingResult.updatedTarget;
  }

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

  const success = (elementValid || evolutionValid) && !updatedTarget.protected;

  if (success) {
    updatedAttacker.hp += damage;
    updatedAttacker.isResting = true;

    updatedTarget.hp = Math.max(0, updatedTarget.hp - damage);
    updatedTarget.protected = game.round === undefined || game.round <= 3;

    triggerParasiticTrait(updatedAttacker, damage, allPlayers, traitsTriggered);

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
    updatedAttacker.isResting = true;
    updatedAttacker.protected = true;
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
