import { Drug, DrugName, drugs } from "../data/drug";
import { substanceMap } from "../data/substances";
import { EfficientTreeMapper } from "../drupmapper/efficienttreemapper";
import { setLoading, showResult } from "./output";
import { urlParser } from "./urlparser";

const mapper = new EfficientTreeMapper(true);

export function initOptimizer() {
  const find = <HTMLButtonElement>document.querySelector("#optimizer #find");
  const drugDropdown = <HTMLSelectElement>document.querySelector("#optimizer #base");
  const steps = <HTMLInputElement>document.querySelector("#optimizer #steps");
  const serachType = <HTMLInputElement>document.querySelector("#optimizer #perStep");

  find.addEventListener("click", () => {
    const drug = drugs[drugDropdown.value as DrugName];
    if (!drug) throw new Error("Invalid drug input selected");

    urlParser.setOptimizer({
      drug: drugDropdown.value as DrugName,
      depth: steps.valueAsNumber,
      perStep: serachType.checked,
    })
    setLoading();
    setTimeout(() => {
      findBest(drug, steps.valueAsNumber, serachType.checked);
    });
  });
  
  const config = urlParser.optimizer;
  if (config) {
    console.log("Found optimizer config:", config);
    drugDropdown.value = config.drug;
    steps.value = config.depth + "";
    serachType.checked = config.perStep;
  }
}

function findBest(drug: () => Drug, steps: number, perStep: boolean) {
  mapper.init(steps, true, drug());

  const best = perStep ? mapper.mostExpensivePerStep : mapper.mostExpensive;
  console.log(`Best option is ${best.id} with a price of ${best.price}`);
  const result = mapper.findRecipe(drug(), JSON.parse(best.id));

  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}