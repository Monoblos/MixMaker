import { Drug, drugs } from "../data/drug";
import { effectMap } from "../data/effects";

export function initDrugDropdown() {
  const drugDropdown = <HTMLSelectElement>document.getElementById("base");
  for (const [name, drug] of Object.entries(drugs).map(([k, d]) => [k, d()]) as [string, Drug][]) {
    const option = document.createElement("option");
    option.value = name;
    option.innerText = name;
    drugDropdown.appendChild(option);
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
    input.title = effect.consumedEffect || "";
    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = effect.name;
    const span = document.createElement("span");
    span.appendChild(input);
    span.appendChild(label);
    searchOptions.appendChild(span);
  }
}