import { drugs } from "../data/drug";
import { substanceMap, SubstanceName } from "../data/substances";
import { showResult } from "./output";

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
  const draggableElements = <NodeListOf<HTMLParagraphElement>>document.querySelectorAll("#simulator #ingredients > p");
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");

  draggableElements.forEach((elem) => {
    elem.addEventListener("dragstart", dragStartHandler);
    elem.addEventListener("dragend", () => {
      const styleSheet = document.styleSheets.item(0)!;
      if (styleSheet.cssRules.item(0)?.cssText.startsWith("#selectedSteps::before")) {
        styleSheet.deleteRule(0);
      }
    });
  });
  
  dropArea.addEventListener("dragover", dragOverHandler, false);
  dropArea.addEventListener("drop", dropHandler);


  const drugDropdown = <HTMLSelectElement>document.querySelector("#simulator #base");
  drugDropdown.addEventListener("change", () => {
    recalcSimulation();
  });
}

function dragStartHandler(ev: DragEvent) {
  const text = (<HTMLParagraphElement>ev.target).innerText;
  dragState.text = text;
}

function dragOverHandler(ev: DragEvent) {
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");
  ev.preventDefault();

  const realTarget = (<HTMLElement>ev.target).closest("p");
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
  const cssText = `{ border: 1px solid blue; content: ""; position: absolute; width: 110px; margin-top: ${15 + (32 * dragState.index) + (dragState.after ? 16 : -16)}px; }`;
  const styleSheet = document.styleSheets.item(0)!;
  if (styleSheet.cssRules.item(0)?.cssText.startsWith("#selectedSteps::before")) {
    styleSheet.deleteRule(0);
  }
  styleSheet.insertRule("#selectedSteps::before " + cssText);
}

function dropHandler(ev: DragEvent) {
  const dropArea = <HTMLDivElement>document.querySelector("#simulator #selectedSteps");
  ev.preventDefault();

  const text = dragState.text;

  const textContent = document.createElement("span");
  textContent.innerText = text;

  const xMark = document.createElement("span");
  xMark.innerText = "X";
  xMark.classList.add("clickable");
  xMark.classList.add("xmark");
  xMark.addEventListener("click", function() {
    this.parentElement?.parentElement?.removeChild(this.parentElement);
    recalcSimulation();
  });

  const toAdd = document.createElement("p");
  toAdd.appendChild(textContent);
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

  const dropIndex = dragState.index;
  const after = dragState.after;
  const insertAt = dropIndex + (after ? 1 : 0);

  const children = [...dropArea.children];
  dropArea.innerHTML = "";
  children.splice(insertAt, 0, toAdd);
  for (const child of children) {
    dropArea.appendChild(child);
  }
  recalcSimulation();
}

function recalcSimulation() {
  const drugDropdown = <HTMLSelectElement>document.querySelector("#simulator #base");
  const drug = drugs[drugDropdown.value];
  if (!drug) throw new Error("Invalid drug input selected");

  let realDrug = drug();

  const selectedSteps = <NodeListOf<HTMLSpanElement>>document.querySelectorAll("#simulator #selectedSteps > p > :first-child");
  selectedSteps.forEach((element, index) => {
    if (index > preview.index) return;
    realDrug.apply(substanceMap[element.innerText as SubstanceName]);
  });

  showResult(realDrug);
}