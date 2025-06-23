import {
  EVOLUTION_TRAITS,
  PLAYER_TYPE,
  PLAYER_TYPE_LABELS,
  TRAIT_LABELS,
} from "@/constants";

export const getTraitLabel = (trait: EVOLUTION_TRAITS): string => {
  return TRAIT_LABELS[trait as EVOLUTION_TRAITS] || trait;
};

export const getPlayerTypeLabel = (type: PLAYER_TYPE) => {
  return PLAYER_TYPE_LABELS[type as PLAYER_TYPE] || type;
};
