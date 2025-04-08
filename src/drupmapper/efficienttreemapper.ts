import { Drug } from "../data/drug";
import { EffectName, getEffectId, getEffectList, minimizeEffectList } from "../data/effects";
import { substanceMap, SubstanceName, substanceTypes } from "../data/substances";
import Queue from 'yocto-queue';

type SubstanceTreeNode = {
  parent?: {
    substance: SubstanceName,
    node: SubstanceTreeNode
  }
  children: Record<SubstanceName, SubstanceTreeNode | undefined>;
}

function getNodeDepth(node: SubstanceTreeNode) {
  let depth = 0;
  while (node.parent?.node) {
    node = node.parent.node
    depth++;
  }
  return depth;
}

function getSubstanceList(node: SubstanceTreeNode) {
  const list: SubstanceName[] = [];
  while (node.parent?.node) {
    list.unshift(node.parent.substance);
    node = node.parent.node;
  }
  return list;
}

export class EfficientTreeMapper {
  private substanceTree: SubstanceTreeNode = {
    children: { } as Record<SubstanceName, undefined>
  }
  private knownCombinations: Map<string, SubstanceTreeNode> = new Map();

  public mostExpensive = {
    id: "[]",
    price: 0
  };
  public mostExpensivePerStep = {
    id: "[]",
    price: 0
  };

  public constructor(private optimize = false) { }

  public get nodeCount() {
    return this.knownCombinations.size;
  }

  private addNode(effectList: EffectName[], substances: SubstanceName[], node: SubstanceTreeNode): SubstanceTreeNode | null {
    const nodeId = minimizeEffectList(effectList);
    const existingNode = this.knownCombinations.get(nodeId);
    if (existingNode && getNodeDepth(existingNode) <= substances.length) {
      // We already know a better combination to get this effect, nothing to do
      return null;
    }

    const substance = substances[substances.length - 1];
    node.children[substance] = {
      parent: {
        substance,
        node
      },
      children: { } as Record<SubstanceName, undefined>
    }

    this.knownCombinations.set(nodeId, node.children[substance]);

    return node.children[substance];
  }

  private updateMaxPrice(drug: Drug, substances: SubstanceName[]) {
    if (!this.optimize) return;
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

  private addLayers(queue: Queue<{node: SubstanceTreeNode, drug: Drug, subs: SubstanceName[]}>, maxDepth: number, getBaseDrug: () => Drug) {
    let deepestLayer = 0;
    let node;

    while (node = queue.dequeue()) {
      const baseDrug = node.drug;
      const baseSubstances = node.subs;
      if (deepestLayer < baseSubstances.length) {
        console.log(`Reched depth ${++deepestLayer} with tree at ${this.nodeCount} nodes.`);
      }
      
      for (const substance of substanceTypes) {
        const subDrug = baseDrug.applyToCopy(substance);
        const subList = baseSubstances.concat(substance);
        const subNode = this.addNode(subDrug.effectList, subList, node.node);

        if (subNode !== null) {
          this.updateMaxPrice(subDrug, subList);
          if (subList.length < maxDepth) {
            queue.enqueue({
              node: subNode,
              drug: subDrug,
              subs: subList
            });
          }
        }
      }
    }
    console.log(`Reched depth ${++deepestLayer} with tree at ${this.nodeCount} nodes.`);
  }

  public init(maxDepth = 5, _: boolean, startDrug?: Drug) {
    // Reset variables
    this.substanceTree = {
      children: { } as Record<SubstanceName, undefined>
    }
    this.knownCombinations = new Map();
    this.mostExpensive = {
      id: "[]",
      price: 0
    };
    this.mostExpensivePerStep = {
      id: "[]",
      price: 0
    };

    startDrug = startDrug || new Drug(0, []);
    const queue = new Queue<{node: SubstanceTreeNode, drug: Drug, subs: SubstanceName[]}>();
    queue.enqueue({
      node: this.substanceTree,
      drug: startDrug,
      subs: []
    });
    this.addLayers(queue, maxDepth, () => new Drug(startDrug.baseprice, startDrug.effectList));
  }

  public findRecipe(drug: Drug, combination: EffectName[]): SubstanceName[] {
    combination.sort((a, b) => a.localeCompare(b));

    let substanceTreeNode: SubstanceTreeNode | undefined = this.knownCombinations.get(minimizeEffectList(combination));
    if (!substanceTreeNode) {
      const query = new RegExp(`${combination.map((e) => `${getEffectId(e)}`).join(".*")}`);
      const ids = [...this.knownCombinations.keys()].filter((n) => query.test(n));
      if (ids.length === 0) {
        console.log("Unable to find any match for " + query);
        throw new Error("Combination not found (1)");
      }
      console.log("Found " + ids.length + " matches for " + query);
      let best = 99;
      for (const id of ids) {
        const node = this.knownCombinations.get(id)!;
        const depth = getNodeDepth(node);
        if (best > depth) {
          substanceTreeNode = node;
          best = depth;
        }
      }
    }

    if (substanceTreeNode === undefined) {
      throw new Error ("Combination not found (4)");
    }
    return getSubstanceList(substanceTreeNode);
  }
}