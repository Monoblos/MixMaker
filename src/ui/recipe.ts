import { DrugName, drugs } from "../data/drug";
import { EffectName, effectNames } from "../data/effects";
import { substanceMap, SubstanceName } from "../data/substances";
import { EfficientMapper } from "../drupmapper/efficientmapper";
import { Mapper } from "../drupmapper/mapper";
import { setLoading, showError, showResult, stopLoading } from "./output";
import { urlParser } from "./urlparser";

const mapper = new EfficientMapper();

(<any>window).mapper = mapper;

const STORED_MAP_NAME = "mapType"

type StoredConfig = {
  drugName: string;
  depth: number;
}

function getSelectedEffects() {
  const targetSelection = <NodeListOf<HTMLInputElement>>document.getElementsByName("effect");
  const combination = [...targetSelection.values()].filter((c) => c.checked).map((c) => c.value) as EffectName[];

  const effects: Partial<Record<EffectName, boolean>> = {};
  for (const effect of combination) {
    effects[effect] = true;
  }
  return effects;
}

export function initRecipe() {
  const generate = <HTMLButtonElement>document.querySelector("#recipe #generate");
  const load = <HTMLButtonElement>document.querySelector("#recipe #load");
  const save = <HTMLButtonElement>document.querySelector("#recipe #save");
  const depth = <HTMLInputElement>document.querySelector("#recipe #depth");
  const linear = <HTMLInputElement>document.querySelector("#recipe #linear");
  const nodes = <HTMLSpanElement>document.querySelector("#recipe #nodes");
  const drugDropdown = <HTMLSelectElement>document.querySelector("#recipe #base");
  const configArea = <HTMLDivElement>document.querySelector("#recipe #withGraph");
  generate.addEventListener("click", () => {
    configArea.hidden = true;
    generate.disabled = true;
    urlParser.setRecipe({
      drug: drugDropdown.value as DrugName,
      depth: depth.valueAsNumber,
      linear: linear.checked,
      effects: getSelectedEffects()
    });
    setLoading();
    setTimeout(() => {
      const drug = drugs[drugDropdown.value as DrugName];
      const time = Date.now();
      mapper.init(depth.valueAsNumber, linear.checked, drug());
      console.log(`Solver took ${Date.now() - time}ms to init for ${depth.valueAsNumber} layers and found ${mapper.nodeCount} nodes.`);
      nodes.innerText = mapper.nodeCount + "";
      configArea.hidden = false;
      generate.disabled = false;
      stopLoading();
    });
  });
  const calc = <HTMLButtonElement>document.querySelector("#recipe #calc");
  calc.addEventListener("click", () => {
    findRecipe(mapper);
  });
  drugDropdown.addEventListener("change", () => {
    configArea.hidden = true;
  });
  depth.addEventListener("change", () => {
    configArea.hidden = true;
  });
  save.addEventListener("click", () => {
    const time = Date.now();
    mapper.saveToStorage();
    console.log(`Took ${Date.now() - time}ms to save ${mapper.nodeCount} nodes.`);
  });

  load.addEventListener("click", () => {
    load.disabled = true;
    setLoading();
    setTimeout( async () => {
      const time = Date.now();
      await mapper.loadFromAdress(drugDropdown.value as DrugName);
      console.log(`Took ${Date.now() - time}ms to load ${mapper.nodeCount} nodes.`);
      nodes.innerText = mapper.nodeCount + "";
      configArea.hidden = false;
      load.disabled = false;
      stopLoading();
    });
  });

  const config = urlParser.recipe;
  if (config) {
    console.log("Found recipe config:", config);
    drugDropdown.value = config.drug;
    depth.value = config.depth + "";
    linear.checked = config.linear;
    for (let i = 0; i < effectNames.length; i++) {
      (<HTMLInputElement>document.querySelector("#effect_" + i)).checked = !!config.effects[effectNames[i]];
    }
  }
}

export function findRecipe(mapper: Mapper) {
  const depth = <HTMLInputElement>document.querySelector("#recipe #depth");
  const linear = <HTMLInputElement>document.querySelector("#recipe #linear");
  const drugDropdown = <HTMLSelectElement>document.querySelector("#recipe #base");
  const drug = drugs[drugDropdown.value as DrugName];
  if (!drug) throw new Error("Invalid drug input selected");

  const targetSelection = <NodeListOf<HTMLInputElement>>document.getElementsByName("effect");
  const combination = [...targetSelection.values()].filter((c) => c.checked).map((c) => c.value) as EffectName[];

  if (combination.length === 0) {
    showError("Nothing selected! Select at least one option from the list above.");
    return;
  }
  if (combination.length > 8) {
    showError("Too many options! Maximum possible effects at once is 8");
    return;
  }

  urlParser.setRecipe({
    drug: drugDropdown.value as DrugName,
    depth: depth.valueAsNumber,
    linear: linear.checked,
    effects: getSelectedEffects()
  });

  let result: SubstanceName[];
  try {
    result = mapper.findRecipe(drug(), combination);
  } catch (e) {
    if (e instanceof Error) {
      showError(e.message);
      return;
    }
    throw e;
  }
  const resultDrug = drug();
  for (const sub of result) {
    resultDrug.apply(substanceMap[sub]);
  }
  showResult(resultDrug, result);
}