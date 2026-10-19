import type {
  Descendant,
  EditorDocumentValue,
  EditorSchemaRepairCode,
  Element,
  Path,
  RootKey,
  Value,
} from '../../interfaces';
import type { FitInputPaths } from './provenance';

export type EditorSchemaModelLocation = Readonly<{
  path: readonly number[];
  property?: string;
  root: RootKey;
}>;

export type EditorSchemaRepair = Readonly<{
  code: EditorSchemaRepairCode;
  impact: 'lossless' | 'lossy';
  inputs: readonly EditorSchemaModelLocation[];
  outputs: readonly EditorSchemaModelLocation[];
  owner: 'document' | 'grammar' | 'property' | 'representation';
}>;

export type EditorSchemaFitReport<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  repairs: readonly EditorSchemaRepair[];
}>;

export type RootCanonicalizationPass = Readonly<{
  input: readonly Descendant[];
  output: readonly Descendant[];
}>;

export const schemaModelLocation = (
  root: RootKey,
  path: readonly number[],
  property?: string
): EditorSchemaModelLocation =>
  Object.freeze({
    path: Object.freeze([...path]),
    ...(property === undefined ? {} : { property }),
    root,
  });

export const schemaRepair = (
  repair: Readonly<{
    code: EditorSchemaRepairCode;
    impact: EditorSchemaRepair['impact'];
    inputs?: readonly EditorSchemaModelLocation[];
    outputs?: readonly EditorSchemaModelLocation[];
    owner: EditorSchemaRepair['owner'];
  }>
): EditorSchemaRepair =>
  Object.freeze({
    code: repair.code,
    impact: repair.impact,
    inputs: Object.freeze([...(repair.inputs ?? [])]),
    outputs: Object.freeze([...(repair.outputs ?? [])]),
    owner: repair.owner,
  });

export class EditorSchemaFitRepairCollector {
  readonly #order: RootKey[] = [];
  readonly #repairs = new Map<RootKey, readonly EditorSchemaRepair[]>();

  replaceRoot(root: RootKey, repairs: readonly EditorSchemaRepair[]) {
    if (!this.#repairs.has(root)) this.#order.push(root);
    this.#repairs.set(root, Object.freeze([...repairs]));
  }

  snapshot() {
    return Object.freeze(
      this.#order.flatMap((root) => this.#repairs.get(root) ?? [])
    );
  }
}

export type RepresentationRepairEvent =
  | Readonly<{
      code: EditorSchemaRepairCode;
      impact?: EditorSchemaRepair['impact'];
      inputs: readonly Descendant[];
      into?: Descendant;
      output?: Descendant;
      properties?: readonly string[];
    }>
  | Readonly<{ from: readonly Descendant[]; rebuilt: Descendant }>;

export type RepresentationRepairSink = (
  event: RepresentationRepairEvent
) => void;

const visitTree = (
  children: readonly Descendant[],
  path: readonly number[],
  visit: (node: Descendant, path: readonly number[]) => void
) => {
  children.forEach((child, index) => {
    const childPath = [...path, index];

    visit(child, childPath);
    if (Object.hasOwn(child, 'children')) {
      visitTree((child as Element).children, childPath, visit);
    }
  });
};

const hasUnexplained = (
  children: readonly Descendant[],
  kept: ReadonlySet<Descendant>,
  explained: ReadonlySet<Descendant>,
  whole: (node: Descendant) => boolean
): boolean =>
  children.some(
    (child) =>
      (!kept.has(child) && !explained.has(child)) ||
      (!whole(child) &&
        Object.hasOwn(child, 'children') &&
        hasUnexplained((child as Element).children, kept, explained, whole))
  );

/**
 * Turns the events of one representation canonicalization, which rewrote
 * `input` into `output`, into repairs. `inputPaths` maps an `input` path to
 * caller paths; the returned `inputsOf` maps an `output` node to them.
 */
export const resolveRepresentationRepairs = (
  input: readonly Descendant[],
  output: readonly Descendant[],
  events: readonly RepresentationRepairEvent[],
  root: RootKey,
  inputPaths: FitInputPaths
): Readonly<{
  inputsOf: (node: Descendant) => readonly Path[];
  repairs: readonly EditorSchemaRepair[];
}> => {
  const sources = new Map<Descendant, ReadonlyArray<readonly number[]>>();
  const places = new Map<Descendant, readonly number[]>();
  const successors = new Map<Descendant, Descendant>();

  visitTree(input, [], (node, path) => sources.set(node, [path]));
  visitTree(output, [], (node, path) => places.set(node, path));

  const inputNodes = new Set(sources.keys());
  const consumed = new Set<Descendant>();
  const produced = new Set<Descendant>();
  const removed = new Set<Descendant>();
  const inserted = new Set<Descendant>();
  const mergeRepairOf = new Map<Descendant, number>();
  const supersededMerges = new Set<number>();
  const carry = (from: readonly Descendant[], to: Descendant) => {
    const paths = from.flatMap((node) => sources.get(node) ?? []);

    sources.set(to, paths);
    produced.add(to);
    for (const node of from) {
      successors.set(node, to);

      const merge = mergeRepairOf.get(node);

      if (merge !== undefined) mergeRepairOf.set(to, merge);
    }

    return paths;
  };
  const lastSuccessor = (node: Descendant) => {
    const seen = new Set<Descendant>();
    let current: Descendant | undefined = node;

    while (
      current &&
      !places.has(current) &&
      !removed.has(current) &&
      !seen.has(current)
    ) {
      seen.add(current);
      current = successors.get(current);
    }

    return current;
  };
  const placeOf = (node: Descendant) => {
    const last = lastSuccessor(node);

    return last && places.get(last);
  };
  const isRemoved = (node: Descendant) => {
    const last = lastSuccessor(node);

    return last !== undefined && removed.has(last);
  };
  const placed: Array<{
    event: Extract<RepresentationRepairEvent, { code: unknown }>;
    inputs: ReadonlyArray<readonly number[]>;
  }> = [];

  for (const event of events) {
    if ('rebuilt' in event) {
      for (const node of event.from) consumed.add(node);
      carry(event.from, event.rebuilt);
      continue;
    }

    for (const node of event.inputs) consumed.add(node);
    if (event.code === 'merge-text') {
      for (const node of event.inputs) {
        const merge = mergeRepairOf.get(node);

        if (merge !== undefined) supersededMerges.add(merge);
      }
    }

    const inputs = event.output
      ? carry(event.inputs, event.output)
      : event.inputs.flatMap((node) => sources.get(node) ?? []);

    if (!event.output) {
      for (const node of event.inputs) removed.add(node);
    } else if (event.inputs.length === 0) {
      inserted.add(event.output);
    }
    if (event.code === 'merge-text' && event.output) {
      mergeRepairOf.set(event.output, placed.length);
    }

    placed.push({ event, inputs });
  }

  if (
    placed.length === 0 ||
    hasUnexplained(output, inputNodes, produced, (node) =>
      inserted.has(node)
    ) ||
    hasUnexplained(input, new Set(places.keys()), consumed, isRemoved)
  ) {
    throw new Error(
      `Unclassified canonical representation mutation in editor root "${root}".`
    );
  }

  const repairs = placed.flatMap(({ event, inputs }, index) => {
    const target = event.into ?? event.output;
    const place = target && placeOf(target);
    const superseded = supersededMerges.has(index);
    const resultDiscarded = target !== undefined && !place;
    const removesNothing = target === undefined && inputs.length === 0;

    if (superseded || resultDiscarded || removesNothing) return [];

    return [
      schemaRepair({
        code: event.code,
        impact: event.impact ?? 'lossless',
        inputs: inputs
          .flatMap(inputPaths)
          .flatMap((path) =>
            event.properties
              ? event.properties.map((key) =>
                  schemaModelLocation(root, path, key)
                )
              : [schemaModelLocation(root, path)]
          ),
        outputs: place ? [schemaModelLocation(root, place)] : [],
        owner: 'representation',
      }),
    ];
  });

  return Object.freeze({
    inputsOf: (node) => (sources.get(node) ?? []).flatMap(inputPaths),
    repairs: Object.freeze(repairs),
  });
};
