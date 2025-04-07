import { Drug, drugs } from "../data/drug";
import { substanceMap } from "../data/substances";
import { GraphMapper } from "../drupmapper/graphmapper";
import { showResult } from "./output";

const mapper = new GraphMapper();

export function initOptimizer() {
  const find = <HTMLButtonElement>document.querySelector("#optimizer #find");
  find.addEventListener("click", () => {
      const drugDropdown = <HTMLSelectElement>document.querySelector("#optimizer #base");
      const drug = drugs[drugDropdown.value];
      if (!drug) throw new Error("Invalid drug input selected");

      const steps = <HTMLInputElement>document.querySelector("#optimizer #steps");

      findBest(drug, steps.valueAsNumber);
  });
}

function findBest(drug: () => Drug, steps: number) {
  mapper.init(steps, true, drug());

  const result = mapper.findRecipe(drug(), JSON.parse(mapper.mostExpensive.id));

  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}