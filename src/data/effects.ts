export const effectNames = [
  "Anti-Gravity",
  "Athletic",
  "Balding",
  "Bright-Eyed",
  "Calming",
  "Calorie-Dense",
  "Cyclopean",
  "Disorienting",
  "Electrifying",
  "Energizing",
  "Euphoric",
  "Explosive",
  "Focused",
  "Foggy",
  "Gingeritis",
  "Glowing",
  "Jennerising",
  "Laxative",
  "Long Faced",
  "Munchies",
  "Paranoia",
  "Refreshing",
  "Schizophrenia",
  "Sedating",
  "Seizure-Inducing",
  "Shrinking",
  "Slippery",
  "Smelly",
  "Sneaky",
  "Spicy",
  "Thought-Provoking",
  "Toxic",
  "Tropic Thunder",
  "Zombifying"
] as const;
export type EffectName = typeof effectNames[number];

const idLength = 4;
export function getEffectId(effect: EffectName) {
  return effect.substring(0, idLength);
}
export function getEffectNameById(effectId: string): EffectName {
  const effect = effectNames.find((en) => en.startsWith(effectId));
  if (!effect) throw new Error("Invalid Effect ID: " + effectId);
  return effect; 
}
export function minimizeEffectList(effects: EffectName[]) {
  return effects.map((e) => getEffectId(e)).join("");
}
export function getEffectList(effectIdList: string): EffectName[] {
  const result: EffectName[] = [];
  for (let i = 0; i < effectIdList.length; i += idLength) {
    result.push(getEffectNameById(effectIdList.substring(i, i + idLength)));
  }
  return result;
}

export class Effect {
  public constructor(public name: EffectName, public multiplier: number, public consumedEffect?: string) {
    
  }
}

export const effectMap: Record<EffectName, Effect> = {
  "Anti-Gravity": new Effect("Anti-Gravity", 0.54, "Low gravity when jumping"),
  "Athletic": new Effect("Athletic", 0.32, "Run faster"),
  "Balding": new Effect("Balding", 0.3, "Loose all hair"),
  "Bright-Eyed": new Effect("Bright-Eyed", 0.4, "Glowing eyes like headlights"),
  "Calming": new Effect("Calming", 0.1),
  "Calorie-Dense": new Effect("Calorie-Dense", 0.28, "Get fat"),
  "Cyclopean": new Effect("Cyclopean", 0.56, "Have only one eye"),
  "Disorienting": new Effect("Disorienting", 0),
  "Electrifying": new Effect("Electrifying", 0.5, "Electric sparks around the body"),
  "Energizing": new Effect("Energizing", 0.22),
  "Euphoric": new Effect("Euphoric", 0.18),
  "Explosive": new Effect("Explosive", 0, "Explode after a short timer"),
  "Focused": new Effect("Focused", 0.16),
  "Foggy": new Effect("Foggy", 0.36, "Fog/Smoke around body. Max sight distance limited"),
  "Gingeritis": new Effect("Gingeritis", 0.2, "Hair changes to red"),
  "Glowing": new Effect("Glowing", 0.48, "Shine bright like a diamond"),
  "Jennerising": new Effect("Jennerising", 0.42, ),
  "Laxative": new Effect("Laxative", 0, "Explosive diarrhea"),
  "Long Faced": new Effect("Long Faced", 0.52, "Head becomes larger"),
  "Munchies": new Effect("Munchies", 0.12),
  "Paranoia": new Effect("Paranoia", 0, "Makes NPCs look at you from wider angles"),
  "Refreshing": new Effect("Refreshing", 0.14),
  "Schizophrenia": new Effect("Schizophrenia", 0, "Makes your controls randomly reverse"),
  "Sedating": new Effect("Sedating", 0.26, "Get tired: Lagging camera and black outline"),
  "Seizure-Inducing": new Effect("Seizure-Inducing", 0, "Get a seizure"),
  "Shrinking": new Effect("Shrinking", 0.6, "Become smaller"),
  "Slippery": new Effect("Slippery", 0.34, "Slide like the floor is ice"),
  "Smelly": new Effect("Smelly", 0),
  "Sneaky": new Effect("Sneaky", 0.24, "Police takes longer to detect you"),
  "Spicy": new Effect("Spicy", 0.38, "Bright burning head"),
  "Thought-Provoking": new Effect("Thought-Provoking", 0.44),
  "Toxic": new Effect("Toxic", 0, "Puke"),
  "Tropic Thunder": new Effect("Tropic Thunder", 0.46, "Invert skin color"),
  "Zombifying": new Effect("Zombifying", 0.58, "Green skin")
}

