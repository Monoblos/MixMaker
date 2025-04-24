import { Drug, DrugName, drugNames } from "../data/drug";
import { EffectName, effectNames } from "../data/effects";
import { getSubstanceList, substanceIds, substanceMap, SubstanceName, substanceTypes } from "../data/substances";

export const tools = [
  "recipe",
  "simulator",
  "optimizer",
] as const;
export type Tool = typeof tools[number];

export type RecipeState = {
  drug: DrugName,
  depth: number,
  linear: boolean,
  effects: Partial<Record<EffectName, boolean>>
}
export type SimulatorState = {
  drug: DrugName,
  recipe: SubstanceName[]
}
export type OptimizerState = {
  drug: DrugName,
  rank: number,
  substances: Partial<Record<SubstanceName, boolean>>
  depth: number,
  perStep: boolean
}

const drugRegex = drugNames.map((dn) => dn.replaceAll(" ", "%20")).join("|")

export class DrugUrlParser {
  public tool?: Tool
  public recipe?: RecipeState;
  public simulator?: SimulatorState;
  public optimizer?: OptimizerState;

  public constructor() {
    const hash = location.hash.substring(1);
    if (hash.startsWith("recipe")) {
      this.parseRecipe(hash.substring("recipe".length));
    } else if (hash.startsWith("simulator")) {
      this.parseSimulator(hash.substring("simulator".length));
    } else if (hash.startsWith("optimizer")) {
      this.parseOptimizer(hash.substring("optimizer".length));
    } else {
      console.warn("Invalid URL hash argument");
    }
  }

  public setTool(tool: Tool) {
    if (this.tool === tool) return;
    this.tool = tool;
    location.assign("#" + tool);
  }

  private parseRecipe(input: string) {
    this.tool = "recipe";
    if (input.length === 0) return;

    const format = new RegExp(`(${drugRegex})(\\d+)([01])([01]{34})`);
    const match = format.exec(input);

    if (match === null) return;

    const effects: Partial<Record<EffectName, boolean>> = {};
    for (let i = 0; i < effectNames.length; i++) {
      effects[effectNames[i]] = match[4].charAt(i) === "1";
    }
    this.recipe = {
      drug: match[1].replaceAll("%20", " ") as DrugName,
      depth: Number.parseInt(match[2]),
      linear: match[3] === "1",
      effects: effects as Record<EffectName, boolean>
    }
  }

  public setRecipe(input: RecipeState) {
    const parts: [Tool, ...string[]] = ["recipe"];
    parts.push(input.drug);
    parts.push(input.depth + "");
    parts.push(input.linear ? "1" : "0");
    for (let i = 0; i < effectNames.length; i++) {
      parts.push(input.effects[effectNames[i]] ? "1" : "0");
    }
    location.assign("#" + parts.join(""));
  }

  private parseSimulator(input: string) {
    this.tool = "simulator";
    if (input.length === 0) return;

    const format = new RegExp(`(${drugRegex})((:?${substanceIds.join("|")})+)`);
    const match = format.exec(input);
    
    if (match === null) return;

    const list = getSubstanceList(match[2]);
    this.simulator = {
      drug: match[1].replaceAll("%20", " ") as DrugName,
      recipe: list
    }
  }

  public setSimulator(input: SimulatorState) {
    const parts: [Tool, ...string[]] = ["simulator"];
    parts.push(input.drug);
    for (const sub of input.recipe) {
      parts.push(substanceMap[sub].id);
    }
    location.assign("#" + parts.join(""));
  }

  private parseOptimizer(input: string) {
    this.tool = "optimizer";
    if (input.length === 0) return;

    const format = new RegExp(`(${drugRegex})(-?\\d+),([01]{${substanceTypes.length}})?,(\\d+),([01])`);
    const match = format.exec(input);

    if (match === null) return;
    
    const substances: Partial<Record<SubstanceName, boolean>> = {};
    for (let i = 0; i < substanceTypes.length; i++) {
      substances[substanceTypes[i]] = match[2] === "-1" ? match[3].charAt(i) === "1" : true;
    }

    this.optimizer = {
      drug: match[1].replaceAll("%20", " ") as DrugName,
      rank: Number.parseInt(match[2]),
      substances,
      depth: Number.parseInt(match[4]),
      perStep: match[5] === "1"
    }
  }

  public setOptimizer(input: OptimizerState) {
    const parts: [Tool, ...string[]] = ["optimizer"];
    parts.push(input.drug);
    parts.push(input.rank + "");
    parts.push(",");
    for (let i = 0; i < substanceTypes.length; i++) {
      parts.push(input.substances[substanceTypes[i]] ? "1" : "0");
    }
    parts.push(",");
    parts.push(input.depth + "");
    parts.push(",");
    parts.push(input.perStep ? "1" : "0");
    location.assign("#" + parts.join(""));
  }
}

export const urlParser = new DrugUrlParser();