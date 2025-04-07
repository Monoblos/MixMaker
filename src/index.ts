import { Drug, drugs } from "./data/drug";
import { effectMap, type EffectName } from "./data/effects";
import { substanceMap, type SubstanceName } from "./data/substances";
import { GraphMapper } from "./drupmapper/graphmapper";
import { initDrugDropdown, initIngredients, initTargetOptions } from "./ui/initinputs";
import { initOptimizer } from "./ui/optimizer";
import { clear, showError, showResult } from "./ui/output";
import { findRecipe } from "./ui/recipe";
import { initSimulation } from "./ui/simulation";

const tool = <HTMLSelectElement>document.getElementById("tool");
const tools = {
  recipe: <HTMLDivElement>document.querySelector("#recipe"),
  simulator: <HTMLDivElement>document.querySelector("#simulator"),
  optimizer: <HTMLDivElement>document.querySelector("#optimizer")
}
document.querySelector

// Init dropdowns
initDrugDropdown();
initTargetOptions();
initIngredients();

const mapper = new GraphMapper();

// Tool selection
tool.addEventListener("change", (e) => {
  clear();
  for (const [key, value] of Object.entries(tools)) {
    value.hidden = key !== tool.value;
  }
});

// Recipe
const load = <HTMLButtonElement>document.querySelector("#recipe #load");
const depth = <HTMLInputElement>document.querySelector("#recipe #depth");
const linear = <HTMLInputElement>document.querySelector("#recipe #linear");
const nodes = <HTMLSpanElement>document.querySelector("#recipe #nodes");
load.addEventListener("click", () => {
  mapper.init(depth.valueAsNumber, linear.checked);
  nodes.innerText = mapper.nodeCount + "";
  (<HTMLDivElement>document.querySelector("#recipe #withGraph")).hidden = false;
});
const calc = <HTMLButtonElement>document.querySelector("#recipe #calc");
calc.addEventListener("click", () => {
  findRecipe(mapper);
});

// Simulation
initSimulation();

initOptimizer();

(<any>window).mapper = mapper;