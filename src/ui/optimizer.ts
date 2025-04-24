import { Drug, DrugName, drugs } from "../data/drug";
import { getEffectList } from "../data/effects";
import { substanceMap, SubstanceName } from "../data/substances";
import { EfficientMapper } from "../drupmapper/efficientmapper";
import { setLoading, showResult } from "./output";
import { urlParser } from "./urlparser";

const mapper = new EfficientMapper(true);

export function initOptimizer() {
  const find = <HTMLButtonElement>document.querySelector("#optimizer #find");
  const drugDropdown = <HTMLSelectElement>document.querySelector("#optimizer #base");
  const steps = <HTMLInputElement>document.querySelector("#optimizer #steps");
  const serachType = <HTMLInputElement>document.querySelector("#optimizer #perStep");
  const rankSelection = <HTMLSelectElement>document.querySelector("#optimizer #rankSelection");
  const substanceSelection = <HTMLSelectElement>document.querySelector("#optimizer #substanceSelection");

  rankSelection.addEventListener("change", () => {
    substanceSelection.hidden = rankSelection.value !== "-1";
  });

  find.addEventListener("click", () => {
    const drug = drugs[drugDropdown.value as DrugName];
    if (!drug) throw new Error("Invalid drug input selected");

    urlParser.setOptimizer({
      drug: drugDropdown.value as DrugName,
      depth: steps.valueAsNumber,
      perStep: serachType.checked,
    });

    let substances: SubstanceName[] = [];

    if (rankSelection.value === "-1") {
      const substanceElements = <NodeListOf<HTMLInputElement>>document.getElementsByName("substance");
      substances = [...substanceElements.values()].filter((c) => c.checked).map((c) => c.value) as SubstanceName[];
    } else {
      const selectedRank = Number.parseInt(rankSelection.value);
      for (const sub of Object.values(substanceMap)) {
        if (sub.minRank <= selectedRank) {
          substances.push(sub.name);
        }
      }
    }

    setLoading();
    setTimeout(() => {
      findBest(drug, steps.valueAsNumber, serachType.checked, substances);
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

function findBest(drug: () => Drug, steps: number, perStep: boolean, combination: SubstanceName[]) {
  mapper.init(steps, true, drug(), combination);

  const best = perStep ? mapper.mostExpensivePerStep : mapper.mostExpensive;
  console.log(`Best option is ${best.id} with a price of ${best.price}`);
  const result = mapper.findRecipe(drug(), getEffectList(best.id));

  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}