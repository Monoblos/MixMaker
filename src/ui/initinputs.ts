import { Drug, drugs } from "../data/drug";
import { effectMap } from "../data/effects";
import { substanceMap } from "../data/substances";

export function initDrugDropdown() {
  const drugDropdown = <NodeListOf<HTMLSelectElement>>document.getElementsByName("drug");
  console.log(`Adding drug names to ${drugDropdown.length} dropdowns`);
  for (const [name, drug] of Object.entries(drugs).map(([k, d]) => [k, d()]) as [string, Drug][]) {
    drugDropdown.forEach((elem) => {
      const option = document.createElement("option");
      option.value = name;
      option.innerText = name;
      elem.appendChild(option);
    });
  }
}

export function initTargetOptions() {
  const searchOptions = <HTMLDivElement>document.getElementById("selection");
  let counter = 0;
  for (const effect of Object.values(effectMap)) {
    const id = "effect_" + counter++;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "effect";
    input.value = effect.name;
    input.id = id;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = effect.name;
    const span = document.createElement("span");
    span.title = effect.consumedEffect || "";
    span.appendChild(input);
    span.appendChild(label);
    searchOptions.appendChild(span);
  }
}

export function initIngredients() {
  const ingredients = <HTMLDivElement>document.getElementById("ingredients");
  for (const substance of Object.values(substanceMap)) {
    const dndTemplate = document.createElement("p");
    dndTemplate.innerText = substance.name;
    dndTemplate.draggable = true;
    ingredients.appendChild(dndTemplate);
  }
}