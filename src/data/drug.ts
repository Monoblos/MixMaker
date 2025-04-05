import { Effect, effectMap, type EffectName } from "../data/effects";
import { Substance } from "./substances";

export class Drug {
  public effectList: Effect[]
  public constructor(public baseprice: number, effectList: EffectName[]) {
    this.effectList = effectList.map((e) => effectMap[e]);
  };

  public apply(substance: Substance) {
    // Go through all current effects to check what needs replacement
    for (let i = 0; i < this.effectList.length; i++) {
      // Find if effect is mention in replacement list of substance
      const rep = substance.effectReplacements.findIndex(([erk]) => erk === this.effectList[i]?.name);
      const replacement = substance.effectReplacements[rep]?.[1];
      if (!replacement) continue;
      // Remove if duplicate
      if (this.effectList.some(({name: en}) => en === replacement)) {
        this.effectList.splice(i, 1);
        continue;
      }
      // Replace if found
      this.effectList[i] = effectMap[replacement];
    }
    // Add base effect if not already existing
    if (this.effectList.length < 8 && !this.effectList.some(({name: en}) => en === substance.baseEffect)) {
      this.effectList.push(effectMap[substance.baseEffect]);
    }
    // Sort the list to gurantee an order
    this.effectList.sort((a, b) => a.name.localeCompare(b.name));
  }

  public get price() {
    const modifier = this.effectList.reduce((p, c) => p + c.multiplier, 1);
    return Math.round(this.baseprice * modifier);
  }

  public get id() {
    return JSON.stringify(this.effectList.map((e) => e.name));
  }
}

export const drugs: Record<string, ()=>Drug> = {
  "OG Kush": () => new Drug(35, ["Calming"]),
  "Sour Diesel": () => new Drug(35, ["Refreshing"]),
  "Green Crack": () => new Drug(35, ["Energizing"]),
  "Granddady Purple": () => new Drug(35, ["Sedating"]),
  "Meth": () => new Drug(70, []),
  "Cocain": () => new Drug(150, []),
}