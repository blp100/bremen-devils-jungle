import {
  EVOLUTION_TRAITS,
  PLAYER_TYPE,
  PLAYER_TYPE_LABELS,
  TRAIT_LABELS,
  TRAIT_DESCRIPTIONS,
} from "@/constants";

export const getTraitLabel = (trait: EVOLUTION_TRAITS): string => {
  return TRAIT_LABELS[trait as EVOLUTION_TRAITS] || trait;
};

export const getPlayerTypeLabel = (type: PLAYER_TYPE) => {
  return PLAYER_TYPE_LABELS[type as PLAYER_TYPE] || type;
};

export const getTraitDescription = (trait: string) => {
  return TRAIT_DESCRIPTIONS[trait as EVOLUTION_TRAITS] || "";
};
