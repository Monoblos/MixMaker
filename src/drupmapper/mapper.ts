import { Drug } from "../data/drug";
import { EffectName } from "../data/effects";
import { SubstanceName } from "../data/substances";

export interface Mapper {
  init(maxDepth: number, linear: boolean, startDrug?: Drug): void;
  findRecipe(drug: Drug, combination: EffectName[]): SubstanceName[];
}