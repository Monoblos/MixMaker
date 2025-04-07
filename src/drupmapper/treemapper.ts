import { Drug } from "../data/drug";
import { EffectName, getEffectId, getEffectList, minimizeEffectList } from "../data/effects";
import { substanceMap, SubstanceName, substanceTypes } from "../data/substances";

type EffectTreeNode = {
  best: SubstanceName[],
  checked: boolean
  children: Record<EffectName, EffectTreeNode | undefined>;
}

export class TreeMapper {
  private effectTree: EffectTreeNode = {
    best: [],
    checked: false,
    children: { } as Record<EffectName, undefined>
  }
  private knownCombinations: Set<string> = new Set();
  private nodeCounter = 0;

  public mostExpensive = {
    id: "[]",
    price: 0
  };
  public mostExpensivePerStep = {
    id: "[]",
    price: 0
  };

  public constructor() { }

  public get nodeCount() {
    return this.nodeCounter;
  }

  private addNode(effectList: EffectName[], substances: SubstanceName[]): EffectTreeNode | null {
    let effectTreeNode = this.effectTree;
    for (const eff of effectList) {
      if (!effectTreeNode.children[eff]) {
        effectTreeNode.children[eff] = {
          best: [],
          checked: false,
          children: { } as Record<EffectName, undefined>
        }
      }
      effectTreeNode = effectTreeNode.children[eff]!;
    }
    if (effectTreeNode.best.length === 0 || effectTreeNode.best.length > substances.length) {
      effectTreeNode.best = substances;
      // Finding a better recipe for this invalidates all child results
      effectTreeNode.checked = false;
    }

    // If we already visited and checked for children we can abort here
    if (effectTreeNode.checked) return null;
    // Otherwise give back the new node to continue the search
    return effectTreeNode;
  }

  private updateMaxPrice(drug: Drug, substances: SubstanceName[]) {
    const id = drug.id;
    const price = drug.price;
    if (this.mostExpensive.price < price) {
      this.mostExpensive.price = price;
      this.mostExpensive.id = id;
    }
    const perStep = (price - drug.baseprice) / (substances.length + 1);
    if (this.mostExpensivePerStep.price < perStep) {
      this.mostExpensivePerStep.price = perStep;
      this.mostExpensivePerStep.id = id;
    }
  }

  private addLayer(substances: SubstanceName[], maxDepth: number, drug: Drug) {
    for (const substance of substanceTypes) {
      const subDrug = drug.applyToCopy(substanceMap[substance]);
      const subList = [...substances, substance];
      const effNode = this.addNode(subDrug.effectList, subList);
      this.knownCombinations.add(minimizeEffectList(subDrug.effectList));
      this.updateMaxPrice(subDrug, substances)
      if (effNode !== null && subList.length < maxDepth) {
        effNode.checked = true;
        this.addLayer(subList, maxDepth, subDrug);
      }
    }
  }

  public init(maxDepth = 5, _: boolean, startDrug?: Drug) {
    // Reset variables
    this.effectTree = {
      best: [],
      checked: false,
      children: { } as Record<EffectName, undefined>
    }
    this.knownCombinations = new Set();
    this.mostExpensive = {
      id: "[]",
      price: 0
    };
    this.mostExpensivePerStep = {
      id: "[]",
      price: 0
    };
    this.nodeCounter = 0;

    startDrug = startDrug || new Drug(0, []);
    this.addLayer([], maxDepth, startDrug);
  }

  private getNodeByList(combination: EffectName[]) {
    let effectTreeNode = this.effectTree;
    for (const eff of combination) {
      effectTreeNode = effectTreeNode.children[eff]!;
      if (!effectTreeNode) {
        throw new Error("Combination not found (3)");
      }
    }
    return effectTreeNode;
  }

  public findRecipe(drug: Drug, combination: EffectName[]): SubstanceName[] {
    combination.sort((a, b) => a.localeCompare(b));

    let effectTreeNode: EffectTreeNode | undefined = undefined;
    if (this.knownCombinations.has(minimizeEffectList(combination))) {
      effectTreeNode = this.getNodeByList(combination);
    } else {
      const query = new RegExp(`${combination.map((e) => `${getEffectId(e)}`).join(".*")}`);
      const ids = [...this.knownCombinations.keys()].filter((n) => query.test(n));
      if (ids.length === 0) {
        console.log("Unable to find any match for " + query);
        throw new Error("Combination not found (1)");
      }
      console.log("Found " + ids.length + " matches for " + query);
      for (const id of ids) {
        const node = this.getNodeByList(getEffectList(id));
        if (!node.best.length) continue;
        if (!effectTreeNode || !effectTreeNode.best.length || effectTreeNode.best.length > node.best.length) {
          console.log("Found " + ids.length + " matches for " + query);
          effectTreeNode = node;
        }
      }
    }

    if (effectTreeNode === undefined) {
      throw new Error ("Combination not found (4)");
    }
    const path = effectTreeNode.best;
    if (!path.length) {
      throw new Error("Combination not found (2)");
    }
    return path;
  }
}