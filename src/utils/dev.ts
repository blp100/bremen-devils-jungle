import { createPlayer } from "./player";

// convenient helper functions for dev
export const createDummyPlayers = async (num: number) => {
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
  ];
  for (let i = 0; i < num; i++) {
    await createPlayer(names[i]);
  }
};
