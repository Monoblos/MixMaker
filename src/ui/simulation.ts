import { DrugName, drugs } from "../data/drug";
import { substanceMap, SubstanceName } from "../data/substances";
import { createSimulationElement } from "./initinputs";
import { showError, showResult } from "./output";
import { urlParser } from "./urlparser";

const dragState = {
  text: "",
  index: -1,
  after: true,
  lastY: 0
}
const preview = {
  active: true,
  index: 100
}

export function initSimulation() {
  const draggableElements = <NodeListOf<HTMLParagraphElement>>document.querySelectorAll("#simulator #ingredients > *");
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");

  draggableElements.forEach((elem) => {
    elem.addEventListener("dragstart", dragStartHandler);
    elem.addEventListener("dragend", () => {
      const styleSheet = document.styleSheets.item(0)!;
      if (styleSheet.cssRules.item(0)?.cssText.startsWith("#selectedSteps::before")) {
        styleSheet.deleteRule(0);
      }
    });
    elem.addEventListener("click", () => {
      addElement(elem.innerText);
      recalcSimulation(true);
    });
  });
  
  dropArea.addEventListener("dragover", dragOverHandler, false);
  dropArea.addEventListener("drop", dropHandler);


  const drugDropdown = <HTMLSelectElement>document.querySelector("#simulator #base");
  drugDropdown.addEventListener("change", () => {
    recalcSimulation();
  });

  const config = urlParser.simulator;
  if (config) {
    console.log("Found simulator config:", config);
    drugDropdown.value = config.drug;
    for (const sub of config.recipe) {
      addElement(sub);
    }
    setTimeout(recalcSimulation);
  }
}

function dragStartHandler(ev: DragEvent) {
  const text = (<HTMLDivElement>ev.target).querySelector("p")!.innerText;
  dragState.text = text;
}

function dragOverHandler(ev: DragEvent) {
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");
  ev.preventDefault();

  const realTarget = (<HTMLElement>ev.target).closest("div.selectedIngredient");
  if (realTarget === null) {
    dragState.index = dropArea.childElementCount - 1;
    dragState.after = true;
    updateIndicator();
    return;
  }
  const index = [...dropArea.childNodes.values()].indexOf(realTarget);
  if (index === -1) {
    return;
  }
  dragState.index = index;

  if (ev.clientY > dragState.lastY) {
    dragState.after = true;
  } else if (ev.clientY < dragState.lastY) {
    dragState.after = false;
  } else {
    // Do nothing if there is no Y movement
  }
  dragState.lastY = ev.clientY;
  updateIndicator();
}

function updateIndicator() {
  const cssText = `{ border: 1px solid blue; content: ""; position: absolute; width: 110px; margin-top: ${31 + (64 * dragState.index) + (dragState.after ? 32 : -32)}px; }`;
  const styleSheet = document.styleSheets.item(0)!;
  if (styleSheet.cssRules.item(0)?.cssText.startsWith("#selectedSteps::before")) {
    styleSheet.deleteRule(0);
  }
  styleSheet.insertRule("#selectedSteps::before " + cssText);
}

function addElement(text: string, insertAt?: number) {
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");

  const xMark = document.createElement("p");
  xMark.innerText = "X";
  xMark.classList.add("clickable");
  xMark.classList.add("xmark");
  xMark.addEventListener("click", function() {
    this.parentElement?.parentElement?.removeChild(this.parentElement);
    recalcSimulation(true);
  });

  const toAdd = createSimulationElement(text);
  toAdd.classList.add("selectedIngredient");
  toAdd.appendChild(xMark);
  toAdd.addEventListener("mouseenter", (ev) => {
    const realTarget = (<HTMLElement>ev.target).closest("p");
    if (realTarget === null) {
      preview.index = 100;
      return;
    }
    const index = [...dropArea.childNodes.values()].indexOf(realTarget);
    if (index === -1) {
      return;
    }
    preview.index = index;
    recalcSimulation();
  });
  toAdd.addEventListener("mouseleave", (ev) => {
    preview.index = 100;
    recalcSimulation();
  });

  const children = [...dropArea.children];
  dropArea.innerHTML = "";
  if (insertAt !== undefined) {
    children.splice(insertAt, 0, toAdd);
  } else {
    children.push(toAdd);
  }
  for (const child of children) {
    dropArea.appendChild(child);
  }
}

function dropHandler(ev: DragEvent) {
  ev.preventDefault();

  const text = dragState.text;

  const dropIndex = dragState.index;
  const after = dragState.after;
  const insertAt = dropIndex + (after ? 1 : 0);

  addElement(text, insertAt);
  recalcSimulation(true);
}

function recalcSimulation(setUrl = false) {
  const drugDropdown = <HTMLSelectElement>document.querySelector("#simulator #base");
  const drug = drugs[drugDropdown.value as DrugName];
  if (!drug) {
    return showError("Invalid drug input selected");
  }

  let realDrug = drug();

  const selectedSteps = <NodeListOf<HTMLSpanElement>>document.querySelectorAll("#simulator #selectedSteps .ingredientLabel");
  const ingredients = [...selectedSteps].map((s) => s.innerText as SubstanceName);
  ingredients.forEach((element, index) => {
    if (index > preview.index) return;
    realDrug.apply(substanceMap[element]);
  });

  if (setUrl) {
    urlParser.setSimulator({
      drug: drugDropdown.value as DrugName,
      recipe: [...selectedSteps].map((element) => element.innerText as SubstanceName)
    })
  }

  showResult(realDrug, ingredients, false);
}