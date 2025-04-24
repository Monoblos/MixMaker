import { Drug } from "../data/drug";
import { type EffectName, getEffectId, minimizeEffectList } from "../data/effects";
import { getListPrice, getSubstanceList, Substance, substanceMap, type SubstanceName, substanceTypes as defaultSubstanceTypes } from "../data/substances";
import Queue from 'yocto-queue';
import LZString from "lz-string";

const LOCAL_STORAGE_NAME = "cachedMap";
const CACHE_ITEM_LIMIT = 500 * 1000;

type StoredMap = {
  combinations: [string, string][],
  mostExpensive: string,
  mostExpensivePerStep: string
}

export class EfficientMapper {
  private knownCombinations: Map<string, string> = new Map();

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

  public compress() {
    const stringified = JSON.stringify(<StoredMap>{
      combinations: [...this.knownCombinations.entries()],
      mostExpensive: this.mostExpensive.id,
      mostExpensivePerStep: this.mostExpensivePerStep.id
    });
    console.log("Caching recipe book with JSON size:", stringified.length);
    const compressed = LZString.compress(stringified);
    console.log("Compressed to size:", compressed.length);
    return compressed;
  }

  public compressArray() {
    const stringified = JSON.stringify(<StoredMap>{
      combinations: [...this.knownCombinations.entries()],
      mostExpensive: this.mostExpensive.id,
      mostExpensivePerStep: this.mostExpensivePerStep.id
    });
    console.log("Caching recipe book with JSON size:", stringified.length);
    const compressed = LZString.compressToUint8Array(stringified);
    console.log("Compressed to size:", compressed.length);
    return compressed;
  }

  public saveToStorage() {
    const compressed = this.compress();
    let i = 0;
    for (; i * CACHE_ITEM_LIMIT < compressed.length; i++) {
      console.log(`Inserting part ${i+1} into storage from ${i * CACHE_ITEM_LIMIT} to ${Math.min((i + 1) * CACHE_ITEM_LIMIT, compressed.length)}`);
      localStorage.setItem(LOCAL_STORAGE_NAME + "_" + i, compressed.substring(i * CACHE_ITEM_LIMIT, (i + 1) * CACHE_ITEM_LIMIT));
    }
    console.log(`Stored in ${i} parts.`);
  }

  public loadFromStorage() {
    try {
      const parts = [];
      for (let i = 0;; i++) {
        parts[i] = localStorage.getItem(LOCAL_STORAGE_NAME + "_" + i);
        if (parts[i] === null) {
          parts.pop();
          break;
        }
      }
      const state: StoredMap = JSON.parse(LZString.decompress(parts.join("")));
      // JSON.parse(null) returns null. So if there is nothing to load we get null. Not documented but works like that.
      if (state === null) return;
      this.load(state);
    } catch (e) {
      console.error("Failed to load from storage!", e);
    }
  }

  public async loadFromAdress(name: string) {
    const compressedBook = await fetch("recipes/" + name);
    const content = await compressedBook.bytes();
    console.log("Loaded compressed book with size", content.length);
    const decompressed = LZString.decompressFromUint8Array(content);
    console.log("Decompressed book to size", (decompressed || "").length);
    const book: StoredMap = JSON.parse(decompressed);
    // JSON.parse(null) returns null. So if there is nothing to load we get null. Not documented but works like that.
    if (book === null) {
      console.log("Failed to load");
      return;
    }
    this.load(book);
  }

  private load(state: StoredMap) {
    this.knownCombinations = new Map();
    for (const [key, value] of state.combinations) {
      this.knownCombinations.set(key, value);
    }
    this.mostExpensive.id = state.mostExpensive;
    this.mostExpensivePerStep.id = state.mostExpensivePerStep;
  }

  private addNode(effectList: EffectName[], substances: SubstanceName[]): boolean {
    const nodeId = minimizeEffectList(effectList);
    const existingNode = getSubstanceList(this.knownCombinations.get(nodeId) || "");
    if (existingNode.length > 0 && (
      existingNode.length <= substances.length ||
      getListPrice(existingNode) < getListPrice(substances))
    ) {
      // We already know a better combination to get this effect, nothing to do
      return false;
    }

    const substance = substances[substances.length - 1];

    this.knownCombinations.set(nodeId, substances.map((s) => substanceMap[s].id).join(""));

    return true
  }

  private updateMaxPrice(drug: Drug, substances: SubstanceName[]) {
    if (!this.optimize) return;
    const id = drug.id;
    const price = drug.price - getListPrice(substances);
    if (this.mostExpensive.price < price) {
      this.mostExpensive.price = price;
      this.mostExpensive.id = id;
    }
    const perStep = (price - drug.baseprice) / (substances.length);
    if (this.mostExpensivePerStep.price < perStep) {
      this.mostExpensivePerStep.price = perStep;
      this.mostExpensivePerStep.id = id;
    }
  }

  private addLayers(queue: Queue<{drug: Drug, subs: SubstanceName[]}>, maxDepth: number, substanceTypes: SubstanceName[]) {
    let deepestLayer = 0;
    let node;

    while (node = queue.dequeue()) {
      const baseDrug = node.drug;
      const baseSubstances = node.subs;
      if (deepestLayer < baseSubstances.length) {
        console.log(`Reached depth ${++deepestLayer} with tree at ${this.nodeCount} nodes.`);
      }
      
      for (const substance of substanceTypes) {
        const subDrug = baseDrug.applyToCopy(substance);
        const subList = baseSubstances.concat(substance);
        const subNode = this.addNode(subDrug.effectList, subList);

        if (subNode) {
          this.updateMaxPrice(subDrug, subList);
          if (subList.length < maxDepth) {
            queue.enqueue({
              drug: subDrug,
              subs: subList
            });
          }
        }
      }
    }
    console.log(`Reched depth ${++deepestLayer} with tree at ${this.nodeCount} nodes.`);
  }

  public init(maxDepth = 5, _: boolean, startDrug: Drug, substanceTypes?: SubstanceName[]) {
    // Reset variables
    this.knownCombinations = new Map();
    this.mostExpensive = {
      id: "[]",
      price: 0
    };
    this.mostExpensivePerStep = {
      id: "[]",
      price: 0
    };

    if (!substanceTypes) {
      substanceTypes = [...defaultSubstanceTypes];
    }

    const queue = new Queue<{drug: Drug, subs: SubstanceName[]}>();
    queue.enqueue({
      drug: startDrug,
      subs: []
    });
    this.addLayers(queue, maxDepth, substanceTypes);
  }

  public findRecipe(drug: Drug, combination: EffectName[]): SubstanceName[] {
    combination.sort((a, b) => a.localeCompare(b));

    const substanceListIds: string | undefined = this.knownCombinations.get(minimizeEffectList(combination));
    let substanceList: SubstanceName[] | undefined;
    if (substanceListIds === undefined) {
      const query = new RegExp(`${combination.map((e) => `${getEffectId(e)}`).join(".*")}`);
      const ids = [...this.knownCombinations.keys()].filter((n) => query.test(n));
      if (ids.length === 0) {
        console.log("Unable to find any match for " + query);
        throw new Error("Combination not found (1)");
      }
      console.log("Found " + ids.length + " matches for " + query);
      let best = 99;
      for (const id of ids) {
        const node = getSubstanceList(this.knownCombinations.get(id)!);
        const depth = node.length;
        if (best > depth) {
          substanceList = node;
          best = depth;
        }
      }
    } else {
      substanceList = getSubstanceList(substanceListIds);
    }

    if (substanceList === undefined) {
      throw new Error ("Combination not found (4)");
    }
    return substanceList;
  }
}