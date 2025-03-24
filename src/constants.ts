import { IGameStage } from "./interfaces";

export enum DB_PATH {
  GAME = "game",
  PLAYERS = "players",
  COMBAT_LOGS = "combat_logs",
  TRADING_LOGS = "trading_logs",
}

export enum GAME_STATUS {
  JOINING = "joining", // players are still joining
  IN_PROGRESS = "in_progress", // game is in progress, going through stages
  ENDED = "ended", // game is over, show results
}

export enum PLAYER_TYPE {
  FIRE = "fire",
  WATER = "water",
  WOOD = "wood",
  ELECTRIC = "electric",
}

export enum PLAYER_COUNT {
  MIN = 10,
  MAX = 14,
}

export const CORE_PLAYER_TYPES = [
  PLAYER_TYPE.FIRE,
  PLAYER_TYPE.WATER,
  PLAYER_TYPE.WOOD,
];

export const OPTIONAL_PLAYER_TYPE = PLAYER_TYPE.ELECTRIC;

export enum EVOLUTION_TRAITS {
  // First Round Evolution
  GENE_MUTATION = "Gene Mutation", // During the evolution phase, costs 3 less HP.
  DEADLY_POISON = "Deadly Poison", // During the attack phase, if the owner is the target and dies, the attacker dies as well.
  BLOODTHIRSTY = "Bloodthirsty", // During the attack phase, if the attack succeeds, the owner gains 2 HP, and the target loses 2 additional HP.
  SHARP_SPIKES = "Sharp Spikes", // During the attack phase, when the owner is attacked, the attacker must lose 2 HP before combat.
  HORUS_EYE = "Horus' Eye", // During the discussion phase, the owner can view another player's HP.

  // Second Round Evolution
  AMPHIBIOUS = "Amphibious", // During the attack phase, if the owner and the target are the same element, the owner wins the combat.
  PARASITIC = "Parasitic", // During the attack phase, the owner gains HP when the target successfully attacks.
  FOREST_SCEPTER = "Forest Scepter", // During the attack phase, the owner can determine who goes first when an attack begins.
  TAIL_REGROWTH = "Tail Regrowth", // During the attack phase, the owner can discard 2 attack cards to preserve HP; the attacker still gains the HP bonus if the attack succeeds.
  SPECIES_EXTINCTION = "Species Extinction", // During the discussion phase, the owner can remove 5 HP from all players of a specific number of element. (Only once per game.)

  // Third Round Evolution
  LION_KING = "Lion King", // During the attack phase, the owner can designate one player as their minion. When the owner attacks a target, the minion also attacks that target. (Once a minion is chosen, the owner can no longer attack them.)
  FIERCE_GAZE = "Fierce Gaze", // During the attack phase, the owner can attack a target without using an attack card.
  HIBERNATION = "Hibernation", // During the attack phase, if the owner's attack succeeds, they cannot be targeted for the rest of the phase.
  SCAVENGER = "Scavenger", // During any phase, whenever a player dies, the owner gains 4 HP.
}

export enum GAME_STAGE_TYPE {
  DISCUSSION = "discussion",
  COMBAT = "combat",
  EVOLUTION = "evolution",
}

export const GAME_STAGES: IGameStage[] = [
  // ========== Round 1 ==========
  {
    round: 1,
    type: GAME_STAGE_TYPE.DISCUSSION,
    duration: 15, // minutes
  },
  {
    round: 1,
    type: GAME_STAGE_TYPE.COMBAT,
    damage: 3,
  },
  {
    round: 1,
    type: GAME_STAGE_TYPE.EVOLUTION,
  },

  // ========== Round 2 ==========
  {
    round: 2,
    type: GAME_STAGE_TYPE.DISCUSSION,
    duration: 10, // minutes
  },
  {
    round: 2,
    type: GAME_STAGE_TYPE.COMBAT,
    damage: 4,
  },
  {
    round: 2,
    type: GAME_STAGE_TYPE.EVOLUTION,
  },

  // ========== Round 3 ==========
  {
    round: 3,
    type: GAME_STAGE_TYPE.DISCUSSION,
    duration: 10, // minutes
  },
  {
    round: 3,
    type: GAME_STAGE_TYPE.COMBAT,
    damage: 5,
  },
  {
    round: 3,
    type: GAME_STAGE_TYPE.EVOLUTION,
  },

  // ========== Round 4 ==========
  {
    round: 4,
    type: GAME_STAGE_TYPE.DISCUSSION,
    duration: 10, // minutes
  },
  {
    round: 4,
    type: GAME_STAGE_TYPE.COMBAT,
    damage: 6,
  },
  {
    round: 4,
    type: GAME_STAGE_TYPE.COMBAT,
    damage: 7,
  },
];
