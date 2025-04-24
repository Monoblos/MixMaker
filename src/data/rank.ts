const rankNames = [
  "Street Rat",
  "Hoodlum",
  "Peddler",
  "Hustler",
  "Bagman",
  "Enforcer",
  "Shot Caller",
  "Block Boss",
  "Underlord",
  "Baron",
  "Kingpin"
] as const;

const rankLevels = [
  "I",
  "II",
  "III",
  "IV",
  "V"
] as const;

export const ranks = rankNames.map((rn) => rankLevels.map((rl) => `${rn} ${rl}`)).flat();