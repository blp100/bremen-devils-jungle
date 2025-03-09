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
