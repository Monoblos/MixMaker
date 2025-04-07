import { Drug, drugs } from "../data/drug";
import { substanceMap } from "../data/substances";
import { GraphMapper } from "../drupmapper/graphmapper";
import { TreeMapper } from "../drupmapper/treemapper";
import { setLoading, showResult } from "./output";

const mapper = new TreeMapper();

export function initOptimizer() {
  const find = <HTMLButtonElement>document.querySelector("#optimizer #find");
  find.addEventListener("click", () => {
    const drugDropdown = <HTMLSelectElement>document.querySelector("#optimizer #base");
    const drug = drugs[drugDropdown.value];
    if (!drug) throw new Error("Invalid drug input selected");

    const steps = <HTMLInputElement>document.querySelector("#optimizer #steps");

    setLoading();
    setTimeout(() => {
      findBest(drug, steps.valueAsNumber);
    });
  });
}

function findBest(drug: () => Drug, steps: number) {
  const serachType = <HTMLInputElement>document.querySelector("#optimizer #perStep");
  mapper.init(steps, true, drug());

  const best = serachType.checked ? mapper.mostExpensivePerStep : mapper.mostExpensive;
  console.log(`Best option is ${best.id} with a price of ${best.price}`);
  const result = mapper.findRecipe(drug(), JSON.parse(best.id));

  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}