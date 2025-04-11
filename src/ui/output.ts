import type { Drug } from "../data/drug";
import { effectMap } from "../data/effects";
import { getListPrice, substanceMap, type SubstanceName } from "../data/substances";

const output = <HTMLDivElement>document.getElementById("result");
const errorOut = <HTMLDivElement>document.getElementById("error");
const drugValue = <HTMLSpanElement>document.getElementById("drugValue");
const drugMultiplier = <HTMLSpanElement>document.getElementById("drugMultiplier");
const profit = <HTMLSpanElement>document.getElementById("profit");
const perStepProfit = <HTMLSpanElement>document.getElementById("perStepProfit");
const effects = <HTMLUListElement>document.getElementById("effects");
const pathText = <HTMLParagraphElement>document.getElementById("pathText");
const path = <HTMLOListElement>document.getElementById("path");
const loader = <HTMLSpanElement>document.getElementById("loader");
const toSimulation = <HTMLAnchorElement>document.querySelector("a");

export function showError(text: string) {
  errorOut.innerText = text;
  errorOut.hidden = false;
  output.hidden = true;
  loader.hidden = true;
}

export function setLoading() {
  loader.hidden = false;
  output.hidden = true;
  errorOut.hidden = true;
}
export function stopLoading() {
  loader.hidden = true;
}

export function showResult(drug: Drug, chain: SubstanceName[], showIngredients = true) {
  errorOut.hidden = true;
  output.hidden = false;
  loader.hidden = true;
  drugValue.innerText = drug.price + "";
  drugMultiplier.innerText = (Math.floor(drug.mutliplier * 100) / 100) + "";
  profit.innerText = (drug.price - drug.baseprice - getListPrice(chain)) + "";
  perStepProfit.innerText = (Math.floor((drug.price - drug.baseprice - getListPrice(chain)) / (chain.length) * 100) / 100) + "";
  effects.innerHTML = "";
  for (const effect of drug.effectList) {
    const elem = document.createElement("li");
    elem.innerText = `${effect} (${effectMap[effect].multiplier})`;
    effects.appendChild(elem);
  }

  if (showIngredients) {
    pathText.hidden = false;
    path.hidden = false;
    path.innerHTML = "";
    for (const chainLink of chain) {
      const elem = document.createElement("li");
      elem.innerText = chainLink;
      path.appendChild(elem);
    }
    toSimulation.hidden = false;
    toSimulation.href = `#simulator${drug.name?.replaceAll(" ", "%20")}${chain.map((sub) => substanceMap[sub].id).join("")}`;
  } else {
    pathText.hidden = true;
    path.hidden = true;
    toSimulation.hidden = true;
  }
}

export function clear() {
  errorOut.hidden = true;
  output.hidden = true;
  loader.hidden = true;
}