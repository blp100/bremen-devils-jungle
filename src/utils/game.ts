import { DB_PATH, GAME_STATUS, PLAYER_TYPE } from "../constants";

import { useData, setData, updateData } from "./firebaseHelpers";

import { IGame } from "../interfaces";

import { usePlayers } from "./player";

export const createGame = () => {
  const createdAt = new Date().toISOString();

  setData(DB_PATH.GAME, {
    createdAt,
    status: GAME_STATUS.JOINING,
  });

  setData(DB_PATH.COMBAT_LOGS, {});
  setData(DB_PATH.TRADING_LOGS, {});
  setData(DB_PATH.PLAYERS, {});
};

export const resetGame = () => {
  setData(DB_PATH.GAME, {});
  setData(DB_PATH.COMBAT_LOGS, {});
  setData(DB_PATH.TRADING_LOGS, {});
  setData(DB_PATH.PLAYERS, {});
};

export const useGame = (): { data?: IGame; loading: boolean } => {
  return useData(DB_PATH.GAME);
};

export const useStartGame = () => {
  const { data: players } = usePlayers();

  return () => {
    const playerList = players ? Object.values(players) : [];
    playerList.sort((a, b) => a.id.localeCompare(b.id));

    const playerCount = playerList.length;
    const list = getRandomPlayerAttributeList(playerCount);

    for (let i = 0; i < playerCount; i++) {
      updateData(DB_PATH.PLAYERS + "/" + playerList[i].id, list[i]);
    }

    updateData(DB_PATH.GAME, {
      status: GAME_STATUS.IN_PROGRESS,
      stageIndex: 0,
    });
  };
};

interface IPlayerAttribute {
  number: number;
  type: PLAYER_TYPE;
  elementCount: number;
}

const getRandomPlayerAttributeList = (playerCount: number) => {
  const elementList = <{ type: PLAYER_TYPE; elementCount: number }[]>[];
  const result = <IPlayerAttribute[]>[];

  // TODO: Handle player assignment when player number != 12
  // https://github.com/blp100/bremen-devils-jungle/issues/3
  const types = Object.values(PLAYER_TYPE);
  for (let count = 1; count <= 4; count++) {
    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
      elementList.push({ type: types[typeIndex], elementCount: count });
    }
  }
  shuffle(elementList);

  for (let i = 0; i < playerCount; i++) {
    result.push({
      ...elementList[i],
      number: i + 1,
    });
  }

  return result;
};

const shuffle = (array: any[]) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};
