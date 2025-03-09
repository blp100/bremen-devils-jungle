import { DB_PATH } from "../constants";

import { useData, setData } from "./firebaseHelpers";

import { IPlayer } from "../interfaces";

export const createPlayer = async (nickname: string) => {
  const id = getRandomId();
  const createdAt = new Date().toISOString();

  await setData(DB_PATH.PLAYERS + "/" + id, {
    id,
    createdAt,
    nickname,
  });

  return id;
};

export const usePlayer = (id: string): { data?: IPlayer; loading: boolean } => {
  return useData(`${DB_PATH.PLAYERS}/${id}`);
};

export const usePlayers = (): {
  data?: { [key: string]: IPlayer };
  loading: boolean;
} => {
  return useData(DB_PATH.PLAYERS);
};

const getRandomId = () => {
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += Math.floor(Math.random() * 9).toString();
  }
  return id;
};
