import type { Drug } from "../data/drug";
import type { SubstanceName } from "../data/substances";

const output = <HTMLDivElement>document.getElementById("result");
const errorOut = <HTMLDivElement>document.getElementById("error");
const drugValue = <HTMLSpanElement>document.getElementById("drugValue");
const effects = <HTMLUListElement>document.getElementById("effects");
const path = <HTMLUListElement>document.getElementById("path");

export function showError(text: string) {
  errorOut.innerText = text;
  errorOut.hidden = false;
  output.hidden = true;
}

export function showResult(drug: Drug, chain: SubstanceName[]) {
  errorOut.hidden = true;
  output.hidden = false;
  drugValue.innerText = drug.price + "";
  effects.innerHTML = "";
  for (const effect of drug.effectList) {
    const elem = document.createElement("li");
    elem.innerText = effect.name;
    effects.appendChild(elem);
  }

  path.innerHTML = "";
  for (const chainLink of chain) {
    const elem = document.createElement("li");
    elem.innerText = chainLink;
    path.appendChild(elem);
  }
}