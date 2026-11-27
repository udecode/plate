import type { Editor, EditorDocumentValue } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { valueRootIndex } from './change/document-change';
import {
  isElementNode,
  type JsonElementNode,
  type JsonNode,
} from './change/tokens';
import type { DocumentAdmission } from './document-admission';
import { withPropertyDraws } from './editor-schema';
import { getCompiledEditorSchema } from './plugin-registry';
import { canonicalRecordJson } from './record-store';
import { assertValidElementId } from './reserved-element-id';
import {
  type CompiledEditorSchema,
  uniquePropertiesOf,
} from './schema-compiler';
import { storedElementIdOf } from './stored-element-id';
import {
  documentRootsOf,
  renameChange,
  rootChildrenOf,
  visitElements,
} from './unique-values';
import { countCoreWork } from './work';

const visitRootElements = (
  document: EditorDocumentValue,
  visit: (node: JsonNode, root: string, path: readonly number[]) => void
) => {
  for (const root of documentRootsOf(document)) {
    visitElements(rootChildrenOf(document, root), (node, path) =>
      visit(node, root, path)
    );
  }
};

const withIdAt = (
  node: JsonNode,
  path: readonly number[],
  id: string
): JsonNode => {
  const [at, ...rest] = path;

  if (at === undefined || !isElementNode(node)) return { ...node, id };

  const children = [...node.children];

  children[at] = withIdAt(getDefined(children[at]), rest, id);

  return { ...node, children };
};

export const loadElementIds = (
  schema: CompiledEditorSchema,
  incoming: EditorDocumentValue,
  admission: DocumentAdmission | null
) => {
  if (!schema.everyElementHasId) return null;

  const { descriptor } = getDefined(uniquePropertiesOf(schema).get('id'));
  const reserved = new Set<string>();
  const standIns = new Set<string>();
  const sparesOf = (document: EditorDocumentValue) =>
    admission?.spareLines?.(document, schema) ?? null;
  let next = 0;
  const idAt = (
    node: JsonElementNode,
    root: string | null,
    path: readonly number[]
  ) => ({
    nodeType: typeof node.type === 'string' ? node.type : undefined,
    path,
    root: root === 'main' ? null : root,
  });
  const reserve = (
    node: JsonNode,
    root: string | null,
    path: readonly number[]
  ) => {
    if (!isElementNode(node) || node.id === undefined) return;
    assertValidElementId(node.id, idAt(node, root, path));
    reserved.add(node.id);
  };
  const drawStandIn = () => {
    let standIn = `\u0000${standIns.size}`;

    while (reserved.has(standIn)) standIn += '\u0000';
    standIns.add(standIn);

    return standIn;
  };

  visitRootElements(incoming, reserve);
  for (const { node } of sparesOf(incoming)?.lines ?? []) {
    visitElements([node], (element, path) => reserve(element, null, path));
  }

  return {
    fill: (document: EditorDocumentValue) => {
      const held = new Set<string>();
      const spareHeld = new Set<string>();
      const lacks = (
        node: JsonNode,
        holders: Set<string> | null,
        root: string | null,
        path: readonly number[]
      ) => {
        if (!isElementNode(node)) return false;
        const { id } = node;

        if (id === undefined) return true;
        assertValidElementId(id, idAt(node, root, path));
        if (!standIns.has(id) && !holders?.has(id)) {
          holders?.add(id);
          reserved.add(id);

          return false;
        }

        return true;
      };
      const fillId = () => {
        while (reserved.has(`fill.${next}`)) next += 1;
        const value = `fill.${next}`;

        next += 1;
        reserved.add(value);

        return value;
      };
      const lacking: Array<{ path: readonly number[]; root: string }> = [];
      const spares = sparesOf(document);
      const sharedIds = spares?.sharedIds;
      const hidden: Array<{ line: number; path: readonly number[] }> = [];

      visitRootElements(document, (node, root, path) => {
        if (lacks(node, held, root, path)) lacking.push({ path, root });
      });
      spares?.lines.forEach(({ built, node }, line) =>
        visitElements([node], (element, path) => {
          const elementId = storedElementIdOf(element);
          const holders = built
            ? null
            : elementId !== undefined && sharedIds?.has(elementId)
              ? spareHeld
              : held;

          if (lacks(element, holders, null, path)) {
            hidden.push({ line, path });
          }
        })
      );

      const renames = lacking.map((place) => ({ ...place, value: fillId() }));
      const spareRepair =
        hidden.length > 0
          ? (() => {
              const lines = getDefined(spares).lines.map(({ node }) => node);

              for (const { line, path } of hidden) {
                lines[line] = withIdAt(
                  getDefined(lines[line]),
                  path.slice(1),
                  fillId()
                );
              }

              return getDefined(spares).write(lines);
            })()
          : null;
      const containers = spareRepair?.containers ?? [];
      let repaired: Readonly<{
        change: ReturnType<typeof renameChange>;
        value: EditorDocumentValue;
      }> | null = spareRepair;

      if (renames.length > 0) {
        const spared = repaired?.value ?? document;
        const indexes = new Map<string, ReturnType<typeof valueRootIndex>>();
        const indexOf = (root: string) => {
          let index = indexes.get(root);

          if (!index) {
            index = valueRootIndex(spared, root);
            indexes.set(root, index);
          }

          return index;
        };
        const change = renameChange(
          renames.map(({ path, root, value }) => ({
            from: indexOf(root).nodeRange(path).from,
            key: 'id',
            root,
            value,
          })),
          indexOf
        );

        repaired = {
          change: repaired ? repaired.change.compose(change) : change,
          value: change.apply(spared),
        };
      }

      return repaired && { ...repaired, containers, renames };
    },
    withStandInIds: <T>(read: () => T) =>
      withPropertyDraws(descriptor, drawStandIn, read),
  };
};

export type LoadElementIds = NonNullable<ReturnType<typeof loadElementIds>>;

type Pairs = Array<readonly [old: number, incoming: number]>;

const firstAtOrAfter = (sorted: readonly number[], floor: number) => {
  let low = 0;
  let high = sorted.length;

  while (low < high) {
    const middle = (low + high) >>> 1;

    if (sorted[middle] < floor) low = middle + 1;
    else high = middle;
  }

  return sorted[low];
};

const longestRising = (pairs: Pairs): Pairs => {
  const tails: number[] = [];
  const previous: number[] = [];

  pairs.forEach(([old], at) => {
    let low = 0;
    let high = tails.length;

    while (low < high) {
      const middle = (low + high) >>> 1;

      if (pairs[tails[middle]][0] < old) low = middle + 1;
      else high = middle;
    }
    previous[at] = low > 0 ? tails[low - 1] : -1;
    tails[low] = at;
  });

  const rising: Pairs = [];

  for (let at = tails.at(-1) ?? -1; at >= 0; at = previous[at]) {
    rising.push(pairs[at]);
  }

  return rising.reverse();
};

export const keepElementIdsInLists = <N extends JsonNode>(
  lists: ReadonlyArray<
    readonly [old: readonly JsonNode[], incoming: readonly N[]]
  >
): Array<readonly N[]> => {
  const reserved = new Set<string>();
  const reserve = (node: JsonNode) => {
    const id = storedElementIdOf(node);

    if (id !== undefined) reserved.add(id);
    if (isElementNode(node)) node.children.forEach(reserve);
  };

  for (const [, incoming] of lists) incoming.forEach(reserve);

  const keys = new WeakMap<JsonNode, string>();
  const contentOf = (node: JsonNode): string => {
    let key = keys.get(node);

    if (key === undefined) {
      countCoreWork('pairingContentKeys');
      key = isElementNode(node)
        ? `${canonicalRecordJson(
            Object.fromEntries(
              Object.entries(node).filter(
                ([name]) => name !== 'id' && name !== 'children'
              )
            )
          )}[${node.children.map(contentOf).join(',')}]`
        : canonicalRecordJson(node);
      keys.set(node, key);
    }

    return key;
  };

  const pairEqualContent = (
    old: readonly JsonNode[],
    incoming: readonly JsonNode[]
  ) => {
    const oldAt = new Map<string, number[]>();
    const incomingCount = new Map<string, number>();
    const unpaired = incoming.flatMap((node, at) =>
      storedElementIdOf(node) === undefined ? [at] : []
    );

    if (unpaired.length === 0) return [];
    old.forEach((node, at) => {
      const key = contentOf(node);
      const list = oldAt.get(key);

      if (list) list.push(at);
      else oldAt.set(key, [at]);
    });
    for (const at of unpaired) {
      const key = contentOf(incoming[at]);

      incomingCount.set(key, (incomingCount.get(key) ?? 0) + 1);
    }

    const anchors = longestRising(
      unpaired.flatMap((at) => {
        const key = contentOf(incoming[at]);
        const olds = oldAt.get(key);

        return olds?.length === 1 && incomingCount.get(key) === 1
          ? [[olds[0], at] as const]
          : [];
      })
    );
    const pairs: Pairs = [];
    let oldFloor = 0;
    let next = 0;

    for (const [anchorOld, anchorIncoming] of [
      ...anchors,
      [old.length, incoming.length] as const,
    ]) {
      for (
        ;
        next < unpaired.length && unpaired[next] < anchorIncoming;
        next++
      ) {
        const at = unpaired[next];
        const match = firstAtOrAfter(
          oldAt.get(contentOf(incoming[at])) ?? [],
          oldFloor
        );

        if (match !== undefined && match < anchorOld) {
          pairs.push([match, at]);
          oldFloor = match + 1;
        }
      }
      if (anchorOld < old.length) {
        pairs.push([anchorOld, anchorIncoming]);
        oldFloor = anchorOld + 1;
        next += 1;
      }
    }

    return pairs;
  };

  const keepListIds = (
    old: readonly JsonNode[],
    incoming: readonly JsonNode[]
  ): readonly JsonNode[] => {
    const partner = new Map<number, number>();
    let oldFrom = 0;
    let incomingFrom = 0;

    for (const [oldTo, incomingTo] of [
      ...pairEqualContent(old, incoming),
      [old.length, incoming.length] as const,
    ]) {
      const olds: number[] = [];
      const incomings: number[] = [];

      for (let at = oldFrom; at < oldTo; at++) {
        const id = storedElementIdOf(old[at]);

        if (isElementNode(old[at]) && (id === undefined || !reserved.has(id))) {
          olds.push(at);
        }
      }
      for (let at = incomingFrom; at < incomingTo; at++) {
        const node = incoming[at];

        if (isElementNode(node) && storedElementIdOf(node) === undefined) {
          incomings.push(at);
        }
      }
      for (let at = 0; at < Math.min(olds.length, incomings.length); at++) {
        partner.set(incomings[at], olds[at]);
      }
      if (oldTo < old.length) partner.set(incomingTo, oldTo);
      oldFrom = oldTo + 1;
      incomingFrom = incomingTo + 1;
    }

    let changed = false;
    const paired = [...incoming];

    for (const [at, oldAt] of partner) {
      const node = incoming[at];
      const before = old[oldAt];

      if (!isElementNode(node) || !isElementNode(before)) continue;

      const children = keepListIds(before.children, node.children);
      const id = storedElementIdOf(before);
      const keep = id !== undefined && !reserved.has(id);

      if (!keep && children === node.children) continue;
      changed = true;
      paired[at] = { ...node, ...(keep ? { id } : {}), children };
    }

    return changed ? paired : incoming;
  };

  return lists.map(
    ([old, incoming]) => keepListIds(old, incoming) as readonly N[]
  );
};

export const keepElementIds = <N extends JsonNode>(
  editor: Editor,
  lists: ReadonlyArray<
    readonly [old: readonly JsonNode[], incoming: readonly N[]]
  >
): Array<readonly N[]> =>
  getCompiledEditorSchema(editor).everyElementHasId
    ? keepElementIdsInLists(lists)
    : lists.map(([, incoming]) => incoming);
