import { drugs } from "../data/drug";
import { EffectName } from "../data/effects";
import { substanceMap, SubstanceName } from "../data/substances";
import { GraphMapper } from "../drupmapper/graphmapper";
import { Mapper } from "../drupmapper/mapper";
import { TreeMapper } from "../drupmapper/treemapper";
import { setLoading, showError, showResult, stopLoading } from "./output";

const graph = new GraphMapper();
const tree = new TreeMapper();

const mapper = tree;

(<any>window).graph = graph;
(<any>window).tree = tree;

export function initRecipe() {
  const load = <HTMLButtonElement>document.querySelector("#recipe #load");
  const depth = <HTMLInputElement>document.querySelector("#recipe #depth");
  const linear = <HTMLInputElement>document.querySelector("#recipe #linear");
  const nodes = <HTMLSpanElement>document.querySelector("#recipe #nodes");
  const drugDropdown = <HTMLSelectElement>document.querySelector("#recipe #base");
  load.addEventListener("click", () => {
    const configArea = <HTMLDivElement>document.querySelector("#recipe #withGraph");
    configArea.hidden = true;
    load.disabled = true;
    setLoading();
    setTimeout(() => {
      const drug = drugs[drugDropdown.value];
      mapper.init(depth.valueAsNumber, linear.checked, drug());
      nodes.innerText = mapper.nodeCount + "";
      configArea.hidden = false;
      load.disabled = false;
      stopLoading();
    });
  });
  const calc = <HTMLButtonElement>document.querySelector("#recipe #calc");
  calc.addEventListener("click", () => {
    findRecipe(mapper);
  });
}

export function findRecipe(mapper: Mapper) {
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