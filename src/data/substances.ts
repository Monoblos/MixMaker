import type { EffectName } from "./effects";

export const substanceTypes = [
  "Addy",
  "Banana",
  "Battery",
  "Chili",
  "Cuke",
  "Donut",
  "Energy Drink",
  "Flu Medicine",
  "Gasoline",
  "Horse Semen",
  "Iodine",
  "Mega Bean",
  "Motor Oil",
  "Mouth Wash",
  "Paracetamol",
  "Viagra"] as const;
export type SubstanceName = typeof substanceTypes[number];

const idLength = 3;
export const substanceIds = substanceTypes.map((st) => st.substring(0, idLength));
export type SubstanceId = typeof substanceIds[number];

export function getSubstanceList(substanceIdList: string): SubstanceName[] {
  const result: SubstanceName[] = [];
  for (let i = 0; i < substanceIdList.length; i += idLength) {
    result.push(substanceIdMap[substanceIdList.substring(i, i + idLength)].name);
  }
  return result;
}
export function getListPrice(substances: string | SubstanceName[]): number {
  if (typeof substances === "string") {
    substances = getSubstanceList(substances);
  }
  return substances.reduce((s, c) => s + substanceMap[c].price, 0);
}

export class Substance {
  public id: SubstanceId;
  public constructor(public name: SubstanceName, public price: number, public baseEffect: EffectName, public effectReplacements: Array<[EffectName, EffectName]>) {
    this.id = name.substring(0, 3);
  }
}

const substances = [
  new Substance("Addy", 9, "Thought-Provoking", [
    ["Sedating", "Gingeritis"],
    ["Long Faced", "Electrifying"],
    ["Glowing", "Refreshing"],
    ["Foggy", "Energizing"],
    ["Explosive", "Euphoric"]
  ]),
  new Substance("Banana", 2, "Gingeritis", [
    ["Energizing", "Thought-Provoking"],
    ["Calming", "Sneaky"],
    ["Smelly", "Anti-Gravity"],
    ["Toxic", "Smelly"],
    ["Long Faced", "Refreshing"],
    ["Cyclopean", "Thought-Provoking"],
    ["Focused", "Seizure-Inducing"],
    ["Disorienting", "Focused"],
    ["Paranoia", "Jennerising"],
  ]),
  new Substance("Battery", 8, "Bright-Eyed", [
    ["Munchies", "Tropic Thunder"],
    ["Euphoric", "Zombifying"],
    ["Electrifying", "Euphoric"],
    ["Laxative", "Calorie-Dense"],
    ["Cyclopean", "Glowing"],
    ["Shrinking", "Munchies"]
  ]),
  new Substance("Chili", 7, "Spicy", [
    ["Athletic", "Euphoric"],
    ["Anti-Gravity", "Tropic Thunder"],
    ["Sneaky", "Bright-Eyed"],
    ["Munchies", "Toxic"],
    ["Laxative", "Long Faced"],
    ["Shrinking", "Refreshing"]
  ]),
  new Substance("Cuke", 2, "Energizing", [
    ["Euphoric", "Laxative"],
    ["Toxic", "Euphoric"],
    ["Munchies", "Athletic"],
    ["Slippery", "Munchies"],
    ["Sneaky", "Paranoia"],
    ["Foggy", "Cyclopean"],
    ["Gingeritis", "Thought-Provoking"],
  ]),
  new Substance("Donut", 3, "Calorie-Dense", [
    ["Calorie-Dense", "Explosive"],
    ["Balding", "Sneaky"],
    ["Anti-Gravity", "Slippery"],
    ["Jennerising", "Gingeritis"],
    ["Focused", "Euphoric"],
    ["Shrinking", "Energizing"]
  ]),
  new Substance("Energy Drink", 6, "Athletic", [
    ["Sedating", "Munchies"],
    ["Euphoric", "Energizing"],
    ["Spicy", "Euphoric"],
    ["Tropic Thunder", "Sneaky"],
    ["Disorienting", "Electrifying"],
    ["Glowing", "Disorienting"],
    ["Foggy", "Laxative"],
    ["Schizophrenia", "Balding"],
    ["Focused", "Shrinking"]
  ]),
  new Substance("Flu Medicine", 5, "Sedating", [
    ["Calming", "Bright-Eyed"],
    ["Munchies", "Slippery"],
    ["Athletic", "Munchies"],
    ["Thought-Provoking", "Gingeritis"],
    ["Cyclopean", "Foggy"],
    ["Euphoric", "Toxic"],
    ["Laxative", "Euphoric"],
    ["Focused", "Calming"],
    ["Electrifying", "Refreshing"],
    ["Shrinking", "Paranoia"]
  ]),
  new Substance("Gasoline", 5, "Toxic", [
    ["Gingeritis", "Smelly"],
    ["Sneaky", "Tropic Thunder"],
    ["Jennerising", "Sneaky"],
    ["Munchies", "Sedating"],
    ["Euphoric", "Energizing"],
    ["Energizing", "Euphoric"],
    ["Laxative", "Foggy"],
    ["Disorienting", "Glowing"],
    ["Paranoia", "Calming"],
    ["Electrifying", "Disorienting"],
    ["Shrinking", "Focused"]
  ]),
  new Substance("Horse Semen", 9, "Long Faced", [
    ["Anti-Gravity", "Calming"],
    ["Gingeritis", "Refreshing"],
    ["Thought-Provoking", "Electrifying"]
  ]),
  new Substance("Iodine", 8, "Jennerising", [
    ["Calming", "Balding"],
    ["Toxic", "Sneaky"],
    ["Foggy", "Paranoia"],
    ["Calorie-Dense", "Gingeritis"],
    ["Euphoric", "Seizure-Inducing"],
    ["Refreshing", "Thought-Provoking"]
  ]),
  new Substance("Mega Bean", 7, "Foggy", [
    ["Energizing", "Cyclopean"],
    ["Calming", "Glowing"],
    ["Sneaky", "Calming"],
    ["Jennerising", "Paranoia"],
    ["Athletic", "Laxative"],
    ["Slippery", "Toxic"],
    ["Thought-Provoking", "Energizing"],
    ["Focused", "Disorienting"],
    ["Seizure-Inducing", "Focused"],
    ["Sneaky", "Glowing"],
    ["Thought-Provoking", "Cyclopean"],
    ["Shrinking", "Electrifying"]
  ]),
  new Substance("Motor Oil", 6, "Slippery", [
    ["Munchies", "Schizophrenia"],
    ["Energizing", "Munchies"],
    ["Foggy", "Toxic"],
    ["Euphoric", "Sedating"],
    ["Paranoia", "Anti-Gravity"],
  ]),
  new Substance("Mouth Wash", 4, "Balding", [
    ["Calming", "Anti-Gravity"],
    ["Calorie-Dense", "Sneaky"],
    ["Explosive", "Sedating"],
    ["Focused", "Jennerising"]
  ]),
  new Substance("Paracetamol", 3, "Sneaky", [
    ["Calming", "Slippery"],
    ["Toxic", "Tropic Thunder"],
    ["Spicy", "Bright-Eyed"],
    ["Glowing", "Toxic"],
    ["Foggy", "Calming"],
    ["Munchies", "Anti-Gravity"],
    ["Paranoia", "Balding"],
    ["Electrifying", "Athletic"],
    ["Energizing", "Paranoia"],
    ["Focused", "Gingeritis"]
  ]),
  new Substance("Viagra", 4, "Tropic Thunder", [
    ["Athletic", "Sneaky"],
    ["Euphoric", "Bright-Eyed"],
    ["Laxative", "Calming"],
    ["Disorienting", "Toxic"]
  ])
]

const nameMap: Record<string, Substance> = {};
const idMap: Record<string, Substance> = {};
const completenessCheck: Set<string> = new Set(substanceTypes);
for (const substance of substances) {
  nameMap[substance.name] = substance;
  idMap[substance.id] = substance;
  completenessCheck.delete(substance.name);
}
if (completenessCheck.size) {
  throw new Error("Undefined substances found! Missing: " + [...completenessCheck.values()].join(", "));
}
export const substanceMap: Record<SubstanceName, Substance> = nameMap;
export const substanceIdMap: Record<SubstanceId, Substance> = idMap;