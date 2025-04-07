import { drugs } from "../data/drug";
import { EffectName } from "../data/effects";
import { substanceMap, SubstanceName } from "../data/substances";
import { GraphMapper } from "../drupmapper/graphmapper";
import { showError, showResult } from "./output";

export function findRecipe(mapper: GraphMapper) {
  const drugDropdown = <HTMLSelectElement>document.querySelector("#recipe #base");
  const drug = drugs[drugDropdown.value];
  if (!drug) throw new Error("Invalid drug input selected");

  const targetSelection = <NodeListOf<HTMLInputElement>>document.getElementsByName("effect");
  const combination = [...targetSelection.values()].filter((c) => c.checked).map((c) => c.value) as EffectName[];

  if (combination.length === 0) {
    showError("Nothing selected! Select at least one option from the list above.");
    return;
  }
  if (combination.length > 8) {
    showError("Too many options! Maximum possible effects at once is 8");
    return;
  }

  let result: SubstanceName[];
  try {
    result = mapper.findRecipe(drug(), combination);
  } catch (e) {
    if (e instanceof Error) {
      showError(e.message);
      return;
    }
    throw e;
  }
  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}