import { initDrugDropdown, initIngredients, initTargetOptions } from "./ui/initinputs";
import { initOptimizer } from "./ui/optimizer";
import { clear } from "./ui/output";
import { initRecipe } from "./ui/recipe";
import { initSimulation } from "./ui/simulation";

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
tool.addEventListener("change", (e) => {
  clear();
  for (const [key, value] of Object.entries(tools)) {
    value.hidden = key !== tool.value;
  }
});

// Interaction
initRecipe();
initSimulation();
initOptimizer();