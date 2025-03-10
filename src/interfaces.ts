import { GAME_STAGE_TYPE, PLAYER_TYPE } from "./constants";

export type IGameStage = IDiscussionStage | ICombatStage | IEvolutionStage;

export interface IPlayer {
  id: string;
  number: number;
  nickname: string;
  type: PLAYER_TYPE;
  elementCount: number;
  hp: number;
  protected: boolean;
  attackCards: { [playerNumber: number]: number };
  evolutionCards: number[];
}
export interface IGame {
  createdAt: string;
  status: number;
  stageIndex: number;
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
