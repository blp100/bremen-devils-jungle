import { createPlayer } from "./player";

// convenient helper functions for dev
export const createDummyPlayers = async (num: number, offset = 0) => {
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Hank",
    "Ivy",
    "Jack",
    "Karl",
    "Lily",
    "Mike",
    "Nancy",
  ];
  for (let i = offset; i < offset + num; i++) {
    await createPlayer(names[i]);
  }
};
