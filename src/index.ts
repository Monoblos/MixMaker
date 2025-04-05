import { Drug, drugs } from "./data/drug";
import { effectMap, type EffectName } from "./data/effects";
import { substanceMap, type SubstanceName } from "./data/substances";
import { Mapper } from "./drupmapper/mapper";
import { initDrugDropdown, initTargetOptions } from "./ui/initinputs";
import { showError, showResult } from "./ui/output";

const output = <HTMLDivElement>document.getElementById("result");
const errorOut = <HTMLDivElement>document.getElementById("error");
const depth = <HTMLInputElement>document.getElementById("depth");
const linear = <HTMLInputElement>document.getElementById("linear");
const nodes = <HTMLSpanElement>document.getElementById("nodes");
const load = <HTMLButtonElement>document.getElementById("load");
const calc = <HTMLButtonElement>document.getElementById("calc");
const drugDropdown = <HTMLSelectElement>document.getElementById("base");

// Init dropdowns
initDrugDropdown();
initTargetOptions();


const mapper = new Mapper();

load.addEventListener("click", () => {
  mapper.init(depth.valueAsNumber, linear.checked);
  nodes.innerText = mapper.nodeCount + "";
});

calc.addEventListener("click", () => {
  const drug = drugs[drugDropdown.value];
  if (!drug) throw new Error("Invalid drug input selected");

  const targetSelection = <NodeListOf<HTMLInputElement>>document.getElementsByName("effect");
  const combination = [...targetSelection.values()].filter((c) => c.checked).map((c) => c.value) as EffectName[];

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
});

(<any>window).mapper = mapper;