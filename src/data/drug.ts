import { effectMap, minimizeEffectList, type EffectName } from "../data/effects";
import { type Substance, substanceMap, type SubstanceName } from "./substances";

export class Drug {
  public effectList: EffectName[]
  public constructor(public baseprice: number, effectList: EffectName[], public name?: string) {
    this.effectList = effectList.slice()
  };

  public apply(substance: Substance | SubstanceName) {
    if (typeof substance === "string") {
      substance = substanceMap[substance];
    }

    // Go through ordered replacement list. Effects can't chain "A"->"B"->"C"
    // but can skip "A"->"C" if "B" is present like "B"->"C", "A"->"B" at once.
    for (const [toReplace, replacement] of substance.effectReplacements) {
      const rep = this.effectList.findIndex((eff) => eff === toReplace);
      if (rep !== -1) {
        if (this.effectList.some((eff) => eff === replacement)) {
          this.effectList.splice(rep, 1);
        } else {
          // Replace if found and replacement not present
          this.effectList[rep] = replacement;
        }
      }
    }
    // Add base effect if not already existing
    if (this.effectList.length < 8 && !this.effectList.some((en) => en === substance.baseEffect)) {
      this.effectList.push(effectMap[substance.baseEffect].name);
    }
    // Sort the list to gurantee an order
    this.effectList.sort((a, b) => a.localeCompare(b));
  }

  public applyToCopy(substance: Substance | SubstanceName) {
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
    return minimizeEffectList(this.effectList);
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
  "OG Kush": () => new Drug(35, ["Calming"], drugNames[0]),
  "Sour Diesel": () => new Drug(35, ["Refreshing"], drugNames[1]),
  "Green Crack": () => new Drug(35, ["Energizing"], drugNames[2]),
  "Granddady Purple": () => new Drug(35, ["Sedating"], drugNames[3]),
  "Meth": () => new Drug(70, [], drugNames[4]),
  "Cocain": () => new Drug(150, [], drugNames[5]),
}