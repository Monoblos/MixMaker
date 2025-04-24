import { Drug, drugs } from "../data/drug";
import { effectMap } from "../data/effects";
import { ranks } from "../data/rank";
import { substanceMap } from "../data/substances";

export function initAll() {
  initDrugDropdown();
  initTargetOptions();
  initSubstanceOptions();
  initRanks();
  initIngredients();
}

export function initDrugDropdown() {
  const drugDropdown = <NodeListOf<HTMLSelectElement>>document.getElementsByName("drug");
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
    if (effect.multiplier === 0) {
      label.style.color = "red";
    }
    if (effect.multiplier > 0.44) {
      label.style.color = "green";
    }
    const span = document.createElement("span");
    span.title = `Bonus: ${effect.multiplier}${effect.consumedEffect ? "\n" + effect.consumedEffect : ""}`;
    span.appendChild(input);
    span.appendChild(label);
    searchOptions.appendChild(span);
  }
}

export function initRanks() {
  const rankDropdown = <NodeListOf<HTMLSelectElement>>document.getElementsByName("rank");
  for (const [rankNumber, rankName] of [["-1", "Custom"], ...Object.entries(ranks)]) {
    rankDropdown.forEach((elem) => {
      const option = document.createElement("option");
      option.value = rankNumber;
      option.innerText = rankName;
      elem.appendChild(option);
    });
  }
}

export function initSubstanceOptions() {
  const substanceOptions = <HTMLDivElement>document.getElementById("substanceSelection");
  let counter = 0;
  for (const substance of Object.values(substanceMap)) {
    const id = "substance_" + counter++;
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "substance";
    input.value = substance.name;
    input.id = id;
    input.checked = true;
    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = substance.name;
    const span = document.createElement("span");
    span.title = `Costs ${substance.price}$, unlocks at rank ${ranks[substance.minRank]} and adds ${substance.baseEffect} as well as replacing ${substance.effectReplacements.length} effects.`;
    span.appendChild(input);
    span.appendChild(label);
    substanceOptions.appendChild(span);
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