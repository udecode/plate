import type { EditorDocumentValue, NodeKey } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import {
  createInternalDocumentChange,
  type DocumentChange,
  valueRootIndex,
} from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { RootChange, type RootChangeSection } from './change/root-change';
import { isElementNode, type JsonNode } from './change/tokens';
import { canonicalJsonKey } from './change/transform';
import { generateElementPropertyValue } from './editor-schema';
import {
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  uniquePropertiesOf,
} from './schema-compiler';

const DRAWS = 8;

const MAIN = 'main';

type Place = Readonly<{ path: readonly number[]; root: string }>;

export const documentRootsOf = (document: EditorDocumentValue) => [
  MAIN,
  ...Object.keys(document.roots ?? {})
    .filter((root) => root !== MAIN)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)),
];

const rootChildrenOf = (document: EditorDocumentValue, root: string) =>
  (root === MAIN
    ? document.children
    : (document.roots?.[root] ?? [])) as readonly JsonNode[];

const visitElements = (
  nodes: readonly JsonNode[],
  visit: (node: JsonNode, path: readonly number[]) => void,
  prefix: readonly number[] = []
) => {
  nodes.forEach((node, index) => {
    if (!isElementNode(node)) return;
    const path = [...prefix, index];

    visit(node, path);
    visitElements(node.children, visit, path);
  });
};

const uniqueValuesOf = (
  properties: ReadonlyMap<string, CompiledSchemaProperty>,
  node: JsonNode
) => {
  const values: Array<readonly [string, string]> = [];

  for (const key of properties.keys()) {
    if (node[key] !== undefined) {
      values.push([key, canonicalJsonKey(node[key])]);
    }
  }

  return values;
};

type Holder = Place & Readonly<{ key: NodeKey }>;

type FreshDraw = (
  key: string,
  property: CompiledSchemaProperty,
  taken: (value: unknown) => boolean
) => unknown;

const drawFresh: FreshDraw = (key, property, taken) => {
  for (let draw = 0; draw < DRAWS; draw += 1) {
    const value = generateElementPropertyValue(property);

    if (value !== undefined && !taken(value)) return value;
  }

  throw new Error(
    `Unique property "${key}" has a generator that repeats values: ${DRAWS} draws each returned a value another element holds.`
  );
};

export const renameChange = (
  renames: ReadonlyArray<
    Readonly<{ from: number; key: string; root: string; value: unknown }>
  >,
  indexOf: (root: string) => DocumentIndex
) => {
  const byRoot = Map.groupBy(renames, ({ root }) => root);
  const changes = new Map<string, RootChange>();

  for (const [root, held] of byRoot) {
    const sections: RootChangeSection[] = [
      ...Map.groupBy(held, ({ from }) => from),
    ].map(([from, writes]) => ({
      from,
      properties: {
        set: Object.fromEntries(writes.map(({ key, value }) => [key, value])),
      },
    }));

    changes.set(root, RootChange.create(indexOf(root), sections));
  }

  return createInternalDocumentChange(changes);
};

/**
 * A loaded document's repair: each value two elements store stays on the
 * first in document order, and every later holder takes a fresh value.
 */
export const repairLoadedUniqueValues = (
  document: EditorDocumentValue,
  schema: CompiledEditorSchema
): Readonly<{ change: DocumentChange; value: EditorDocumentValue }> | null => {
  const properties = uniquePropertiesOf(schema);

  if (properties.size === 0) return null;

  const held = new Map<string, Set<string>>(
    [...properties.keys()].map((key) => [key, new Set()])
  );
  const repeats: Array<Place & Readonly<{ key: string }>> = [];

  for (const root of documentRootsOf(document)) {
    visitElements(rootChildrenOf(document, root), (node, path) => {
      for (const [key, value] of uniqueValuesOf(properties, node)) {
        const values = getDefined(held.get(key));

        if (values.has(value)) repeats.push({ key, path, root });
        else values.add(value);
      }
    });
  }
  if (repeats.length === 0) return null;

  const indexOf = (root: string) => valueRootIndex(document, root);
  const renames = repeats.map(({ key, path, root }) => {
    const property = getDefined(properties.get(key));
    const values = getDefined(held.get(key));
    const value = drawFresh(key, property, (candidate) =>
      values.has(canonicalJsonKey(candidate))
    );

    values.add(canonicalJsonKey(value));

    return { from: indexOf(root).nodeRange(path).from, key, path, root, value };
  });
  const change = renameChange(renames, indexOf);

  return { change, value: change.apply(document) };
};

/**
 * A value's holder when a local update began, and whether its key has left
 * the document since.
 */
export type UniqueIncumbent = Readonly<{
  key: NodeKey;
  left: () => boolean;
  root: string;
}>;

/**
 * `holders` come in document order. An import, a load, a replacement or a
 * commit tagged `collaboration` has no incumbent.
 */
export const keptUniqueHolder = <T extends Holder>(
  holders: readonly T[],
  incumbent: UniqueIncumbent | null
): T | undefined =>
  (incumbent &&
    (holders.find(({ key }) => key === incumbent.key) ??
      (incumbent.left()
        ? holders.find(({ root }) => root === incumbent.root)
        : undefined))) ??
  holders[0];

export const repairUniqueHolders = (
  input: Readonly<{
    held: Iterable<readonly [property: string, value: unknown]>;
    holdersOf: (property: string, value: unknown) => readonly Holder[];
    incumbentOf: (property: string, value: unknown) => UniqueIncumbent | null;
    indexOf: (root: string) => DocumentIndex;
    schema: CompiledEditorSchema;
  }>
): DocumentChange | null => {
  const properties = uniquePropertiesOf(input.schema);
  const claimOf = (key: string, value: unknown) =>
    `${key}\u0000${canonicalJsonKey(value)}`;
  const claimed = new Set<string>();
  const renames: Array<
    Readonly<{ from: number; key: string; root: string; value: unknown }>
  > = [];

  for (const [key, value] of input.held) {
    if (claimed.has(claimOf(key, value))) continue;
    claimed.add(claimOf(key, value));
    const holders = input.holdersOf(key, value);

    if (holders.length < 2) continue;
    const kept = keptUniqueHolder(holders, input.incumbentOf(key, value));
    const property = getDefined(properties.get(key));

    for (const { path, root } of holders.filter((held) => held !== kept)) {
      const fresh = drawFresh(
        key,
        property,
        (candidate) =>
          claimed.has(claimOf(key, candidate)) ||
          input.holdersOf(key, candidate).length > 0
      );

      claimed.add(claimOf(key, fresh));
      renames.push({
        from: input.indexOf(root).nodeRange(path).from,
        key,
        root,
        value: fresh,
      });
    }
  }

  return renames.length === 0 ? null : renameChange(renames, input.indexOf);
};
