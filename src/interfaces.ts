import type {
  GAME_STAGE_TYPE,
  PLAYER_TYPE,
  GAME_STATUS,
  EVOLUTION_TRAITS,
} from "./constants";

export type IGameStage = IDiscussionStage | ICombatStage | IEvolutionStage;

export interface IPlayer {
  id: string;
  number: number;
  nickname: string;
  type: PLAYER_TYPE;
  elementCount: number;
  hp: number;
  protected: boolean;
  hasFought?: boolean;
  isResting: boolean;
  isPassed: boolean;
  isDead: boolean;
  attackCards: { [playerNumber: number]: number };
  evolutionCards: EVOLUTION_TRAITS[];
  minionId?: string; // for LION_KING
  parasiticTargetId?: string; // for PARASITIC
}

export interface IGame {
  createdAt: string;
  status: GAME_STATUS;
  stageIndex: number;
  round?: number;
  maxElementCount: number;
  damage: number;
}

interface IBaseGameStage {
  round: number;
  type: GAME_STAGE_TYPE;
}

interface IDiscussionStage extends IBaseGameStage {
  type: GAME_STAGE_TYPE.DISCUSSION;
  duration: number;
}

interface ICombatStage extends IBaseGameStage {
  type: GAME_STAGE_TYPE.COMBAT;
  damage: number;
}

interface IEvolutionStage extends IBaseGameStage {
  type: GAME_STAGE_TYPE.EVOLUTION;
}

export interface ITraitEffectLog {
  trait: EVOLUTION_TRAITS;
  sourceId: string;
  targetId: string;
  damage: number;
  note?: string;
}
