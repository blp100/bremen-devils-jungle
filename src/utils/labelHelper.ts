import { EVOLUTION_TRAITS, TRAIT_LABELS } from "@/constants";

export const getTraitLabel = (trait: EVOLUTION_TRAITS): string => {
  return TRAIT_LABELS[trait as EVOLUTION_TRAITS] || trait;
};
