import type { Editor } from '../interfaces/editor';
import { isElementNode, type JsonNode } from './change/tokens';
import { getCompiledEditorSchema } from './plugin-registry';
import { canonicalRecordJson } from './record-store';

export const storedElementIdOf = (node: JsonNode): string | undefined => {
  const id = isElementNode(node) ? node.id : undefined;

  return typeof id === 'string' ? id : undefined;
};

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

export const keepElementIds = <N extends JsonNode>(
  editor: Editor,
  lists: ReadonlyArray<
    readonly [old: readonly JsonNode[], incoming: readonly N[]]
  >
): Array<readonly N[]> => {
  if (!getCompiledEditorSchema(editor).everyElementHasId) {
    return lists.map(([, incoming]) => incoming);
  }

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
