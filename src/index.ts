import { initDrugDropdown, initIngredients, initTargetOptions } from "./ui/initinputs";
import { initOptimizer } from "./ui/optimizer";
import { clear } from "./ui/output";
import { initRecipe } from "./ui/recipe";
import { initSimulation } from "./ui/simulation";
import { Tool, urlParser } from "./ui/urlparser";

const tool = <HTMLSelectElement>document.getElementById("tool");
const tools = {
  recipe: <HTMLDivElement>document.querySelector("#recipe"),
  simulator: <HTMLDivElement>document.querySelector("#simulator"),
  optimizer: <HTMLDivElement>document.querySelector("#optimizer")
}
document.querySelector

// Init Inputs
initDrugDropdown();
initTargetOptions();
initIngredients();

// Tool selection
function onToolChange() {
  clear();
  for (const [key, value] of Object.entries(tools)) {
    value.hidden = key !== tool.value;
  }
  urlParser.setTool(tool.value as Tool);
}
tool.addEventListener("change", onToolChange);

// Interaction
initRecipe();
initSimulation();
initOptimizer();

if (urlParser.tool) {
  tool.value = urlParser.tool;
  onToolChange();
}