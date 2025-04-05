import Graph from "node-dijkstra";
import { substanceMap, type SubstanceName } from "../data/substances";
import { Drug, drugs } from "../data/drug";
import type { EffectName } from "../data/effects";

type Layer = Set<string>;

function buildEdgeName(from: string, to: string) {
  return from + "-" + to;
}

export class Mapper {
  private graph = new Graph();
  private edgeNames = new Map<string, SubstanceName>();
  private nodes = new Set<string>();

  public constructor() { }

  public get nodeCount() {
    return this.nodes.size;
  }

  public init(maxDepth = 5, linear = false) {
    // Reset variables
    this.edgeNames = new Map();
    this.nodes = new Set();

    // Routes for the graph we are calculating
    const routes: Record<string, Record<string, number>> = {};
    // Effect combinations for which we already tested all children
    const tested = new Set<string>();
    // Layers of tests made
    const layers: Layer[] = [];
    // Initial layer containing all base drugs
    const startLayer: Layer = new Set();

    // Fill the start layer
    for (const key of Object.keys(drugs)) {
      const drug = drugs[key as keyof typeof drugs]!;
      startLayer.add(drug().id);
    }
    layers.push(startLayer);
    console.log(`startLayer has ${startLayer.size} entries`);
    
    // Build a depth-tree with the specified depth
    for (let i = 0; i < maxDepth; i++) {
      // Layer we are building now
      const layer: Layer = new Set();
      // Quick reference to the last layer
      const prevLayer = layers[i]!;

      // Take all results from the previous layer
      for (const key of prevLayer.keys()) {
        // Only check if it wasn't checked already
        if (tested.has(key)) continue;
        routes[key] = {};
        this.nodes.add(key);

        // Keys are a list of effects
        const baseEffects = JSON.parse(key) as EffectName[];
        // Check result for each substance we can apply
        for (const substance of Object.values(substanceMap)) {
          // Create resulting drug and "save" it to the layer
          const drug = new Drug(0, baseEffects);
          drug.apply(substance);
          const drugId = drug.id;
          layer.add(drugId);
          routes[key][drugId] = linear ? 1 : substance.price;
          this.edgeNames.set(buildEdgeName(key, drugId), substance.name);
        }
        // Remember that we tested this effect combination now
        tested.add(key);
      }

      console.log(`Layer ${i + 1} has ${layer.size} entries`);
      layers.push(layer);
    }

    const lastLayer = layers[layers.length - 1]!;
    for (const entry of lastLayer) {
      routes[entry] = {};
      this.nodes.add(entry);
    }

    this.graph = new Graph(routes);
  }

  public findRecipe(drug: Drug, combination: EffectName[]): SubstanceName[] {
    combination.sort((a, b) => a.localeCompare(b));
    const query = new RegExp(`^\\[.*${combination.map((e) => `"${e}"`).join(",.*")}.*\\]$`);
    const nodes = [...this.nodes.keys()].filter((n) => query.test(n));
    console.log(`Found ${nodes.length} results for Query ${query}`);
    if (!nodes.length) {
      throw new Error("Combination not found");
    }
    let path: string[] | null = null;
    const drugId = drug.id;
    for (const node of nodes) {
      path = this.graph.path(drugId, node) as string[] | null;
      if (path !== null) break;
    }
    if (path === null) throw new Error("Combination not possible for this drug");

    const result: SubstanceName[] = [];
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1]!;
      const to = path[i]!;
      const substance = this.edgeNames.get(buildEdgeName(from, to));
      if (!substance) throw new Error(`Got invalid edge from ${from} to ${to} with no linked substance in edge list`);
      result.push(substance);
    }
    return result;
  }
}