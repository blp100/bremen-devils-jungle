import { IPlayer, IGame, ITraitEffectLog } from "@/interfaces";
import { EVOLUTION_TRAITS, PLAYER_TYPE } from "@/constants";

const triggerParasiticEffect = (
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
        note: `PARASITIC: ${parasite.nickname} leeched ${hpGained} HP from ${host.nickname}`,
      });
    }
  }
};

const applyPostCombatTraitEffects = (
  allPlayers: { [key: string]: IPlayer },
  traitsTriggered: ITraitEffectLog[],
  updatedAttacker: IPlayer,
  updatedTarget: IPlayer,
) => {
  // Scavenger
  const someoneDied = updatedAttacker.hp === 0 || updatedTarget.hp === 0;

  for (const playerId in allPlayers) {
    const player = allPlayers[playerId];
    if (
      player.evolutionCards?.includes(EVOLUTION_TRAITS.SCAVENGER) &&
      player.hp > 0 &&
      someoneDied
    ) {
      player.hp += 4;

      triggerParasiticEffect(player, 4, allPlayers, traitsTriggered);

      traitsTriggered.push({
        trait: EVOLUTION_TRAITS.SCAVENGER,
        sourceId: player.id,
        targetId:
          updatedAttacker.hp === 0 ? updatedAttacker.id : updatedTarget.id,
        damage: -4,
        note: `SCAVENGER: ${player.nickname} scavenged 4 HP from the death of ${updatedAttacker.hp === 0 ? updatedAttacker.nickname : updatedTarget.nickname}`,
      });
    }
  }
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
  );

  // Reactive traits
  if (result.success) {
    for (const playerId in allPlayers) {
      const player = allPlayers[playerId];

      // LION_KING: trigger minion follow-up attack
      // TODO: it might be have some logic problem with attack, if the minion attack successed, the damage is 7, the minion would get 4 hp, the lion king would add 3 hp, and the parastic owner would get 4 hp which he's target is minion
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
          allPlayers,
        );
        result.damageDealt += minionResult.damageDealt;
        if (minionResult.success) {
          attacker.hp += 3;
          player.hp = Math.max(0, player.hp - 3);

          triggerParasiticEffect(
            attacker,
            3,
            allPlayers,
            result.traitsTriggered,
          );
        }
        result.target = minionResult.target; // Update target state after minion attack
        applyPostCombatTraitEffects(
          allPlayers,
          result.traitsTriggered,
          minionResult.attacker,
          minionResult.target,
        );
      }
    }
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
) => {
  const updatedAttacker = { ...attacker };
  const updatedTarget = { ...target };

  const traitsTriggered: ITraitEffectLog[] = [];

  applyPreOutcomeEffects(updatedAttacker, updatedTarget);

  const elementValid = _canAttackBasedOnElement(
    attacker,
    target,
    maxElementCount,
  );
  const evolutionValid = _canAttackBasedOnEvolutionCards(attacker, target);

  const success = (elementValid || evolutionValid) && !updatedTarget.protected;

  if (success) {
    updatedAttacker.hp += damage;
    updatedAttacker.isResting = true;

    updatedTarget.hp = Math.max(0, updatedTarget.hp - damage);
    updatedTarget.protected = true;

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
  success: boolean,
  traitsTriggered: ITraitEffectLog[],
  allPlayers: { [key: string]: IPlayer },
) => {
  // BLOODTHIRSTY: attacker gains HP, target takes more damage
  if (
    updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY) ||
    updatedTarget.evolutionCards?.includes(EVOLUTION_TRAITS.BLOODTHIRSTY)
  ) {
    const victor = success ? updatedAttacker : updatedTarget;
    const loser = success ? updatedTarget : updatedAttacker;

    victor.hp += 2;
    triggerParasiticEffect(victor, 2, allPlayers, traitsTriggered);
    loser.hp = Math.max(0, loser.hp - 2);

    traitsTriggered.push(
      {
        trait: EVOLUTION_TRAITS.BLOODTHIRSTY,
        sourceId: victor.id,
        targetId: victor.id,
        damage: -2,
        note: `BLOODTHIRSTY: healed victor ${victor.nickname}`,
      },
      {
        trait: EVOLUTION_TRAITS.BLOODTHIRSTY,
        sourceId: victor.id,
        targetId: loser.id,
        damage: 2,
        note: `BLOODTHIRSTY: dealt extra damage to loser ${loser.nickname}`,
      },
    );
  }

  // DEADLY_POISON: if target dies, attacker also dies
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
      note: `DEADLY_POISON: ${updatedTarget.nickname}'s trait killed ${updatedAttacker.nickname}`,
    });
  }

  // HIBERNATION: attacker becomes protected after successful attack
  if (updatedAttacker.evolutionCards?.includes(EVOLUTION_TRAITS.HIBERNATION)) {
    updatedAttacker.protected = true;
  }
};
