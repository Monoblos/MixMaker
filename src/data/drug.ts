import { Effect, effectMap, type EffectName } from "../data/effects";
import { Substance } from "./substances";

export class Drug {
  public effectList: EffectName[]
  public constructor(public baseprice: number, effectList: EffectName[]) {
    this.effectList = effectList.slice()
  };

  public apply(substance: Substance) {
    // Go through all current effects to check what needs replacement
    for (let i = 0; i < this.effectList.length; i++) {
      // Find if effect is mention in replacement list of substance
      const rep = substance.effectReplacements.findIndex(([erk]) => erk === this.effectList[i]);
      const replacement = substance.effectReplacements[rep]?.[1];
      if (!replacement) continue;
      // Remove if duplicate
      if (this.effectList.some((en) => en === replacement)) {
        this.effectList.splice(i, 1);
        continue;
      }
      // Replace if found
      this.effectList[i] = effectMap[replacement].name;
    }
    // Add base effect if not already existing
    if (this.effectList.length < 8 && !this.effectList.some((en) => en === substance.baseEffect)) {
      this.effectList.push(effectMap[substance.baseEffect].name);
    }
    // Sort the list to gurantee an order
    this.effectList.sort((a, b) => a.localeCompare(b));
  }

  public applyToCopy(substance: Substance) {
    const copy = new Drug(this.baseprice, this.effectList);
    copy.apply(substance);
    return copy;
  }

  public get mutliplier() {
    const modifier = this.effectList.reduce((p, c) => p + effectMap[c].multiplier, 1);
    return modifier;
  }

  public get price() {
    return Math.round(this.baseprice * this.mutliplier);
  }

  public get id() {
    return JSON.stringify(this.effectList);
  }
}

export const drugNames = [
  "OG Kush",
  "Sour Diesel",
  "Green Crack",
  "Granddady Purple",
  "Meth",
  "Cocain"
] as const;
export type DrugName = typeof drugNames[number];

export const drugs: Record<DrugName, ()=>Drug> = {
  "OG Kush": () => new Drug(35, ["Calming"]),
  "Sour Diesel": () => new Drug(35, ["Refreshing"]),
  "Green Crack": () => new Drug(35, ["Energizing"]),
  "Granddady Purple": () => new Drug(35, ["Sedating"]),
  "Meth": () => new Drug(70, []),
  "Cocain": () => new Drug(150, []),
}