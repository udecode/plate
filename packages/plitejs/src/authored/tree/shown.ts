import type { DocumentIndex } from '../../core/change/document-index';
import {
  isElementNode,
  type JsonElementNode,
  type JsonNode,
} from '../../core/change/tokens';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { documentRootsOf } from '../../core/unique-values';
import { countCoreWork } from '../../core/work';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import { type HolderKey, holderKey, shownOf } from './holders';
import { heldProps, type Place } from './holds';
import { type AsMember, readMembers, withMembers } from './marks';
import type { Ready, ReadyShower } from './readiness';

/** Each top-level block settlement rebuilt, by root and rank, beside the block it replaces. */
export type SettledBlocks = ReadonlyMap<
  string,
  ReadonlyMap<number, Readonly<{ after: JsonNode; before: JsonNode }>>
>;

const rebuildWith = (replaced: ReadonlyMap<JsonNode, JsonElementNode>) => {
  const rebuild = (node: JsonNode): JsonNode => {
    if (!isElementNode(node)) return node;

    const own = replaced.get(node) ?? node;
    const children = node.children.map(rebuild);

    return children.some((child, at) => child !== node.children[at])
      ? { ...own, children }
      : own;
  };

  return rebuild;
};

/**
 * Settles what the showers of ready groups show in place of what they store.
 * In document order, the element that shows a value of a ready group writes
 * it when it is the first one left that shows it, its place can hold it and
 * no other element stores it, counting the values earlier writes release.
 * Every other element showing a value of the group drops it. Every element
 * and block it does not change stays the same object.
 */
export const settleReady = (
  value: EditorDocumentValue,
  schema: CompiledEditorSchema,
  { candidates, storers }: Ready,
  indexOf: (root: string) => DocumentIndex
): SettledBlocks => {
  const order = documentRootsOf(value);
  const placed = placesOf(candidates, indexOf);
  const placeOf = (node: JsonNode) => getDefined(placed.get(node));
  const ready = [...candidates].sort((left, right) => {
    const [a, b] = [placeOf(left.shower.node), placeOf(right.shower.node)];

    return (
      order.indexOf(left.shower.root) - order.indexOf(right.shower.root) ||
      a.rank - b.rank ||
      a.at - b.at
    );
  });
  const writes = new Map<JsonNode, Record<string, EditorJsonValue>>();
  const dropped = new Map<JsonNode, Set<string>>();

  for (const key of new Set(ready.map((candidate) => candidate.key))) {
    const first = new Map<string, ReadyShower>();

    for (const candidate of ready) {
      if (candidate.key !== key) continue;

      const { node } = candidate.shower;
      const keys = dropped.get(node) ?? new Set<string>();

      keys.add(key);
      dropped.set(node, keys);
      if (
        !first.has(candidate.at) &&
        Object.hasOwn(
          heldProps(
            schema,
            { [key]: candidate.value, type: node.type },
            { ...placeOf(node).place, text: false }
          ),
          key
        )
      ) {
        first.set(candidate.at, candidate);
      }
    }

    // What each element stores of `key` after the writes so far, and by
    // value how many more elements store it than the record counts.
    const stores = new Map<JsonNode, HolderKey | null>();
    const added = new Map<HolderKey, number>();
    const storedBy = (node: JsonNode) =>
      stores.has(node)
        ? (stores.get(node) ?? null)
        : node[key] === undefined
          ? null
          : holderKey(key, node[key]);
    const shift = (at: HolderKey, by: 1 | -1) =>
      added.set(at, (added.get(at) ?? 0) + by);
    const won = new Set<string>();
    const open = [...first.keys()];

    while (open.length > 0) {
      countCoreWork('contenderVisits');

      const at = getDefined(open.pop());
      const candidate = first.get(at);

      if (!candidate || won.has(at)) continue;

      const { node } = candidate.shower;
      const released = storedBy(node);
      const others =
        storers(at) + (added.get(at) ?? 0) - (released === at ? 1 : 0);

      if (others > 0) continue;
      won.add(at);
      writes.set(node, { ...writes.get(node), [key]: candidate.value });
      if (released === at) continue;
      stores.set(node, at);
      shift(at, 1);
      if (released !== null) {
        shift(released, -1);
        open.push(released);
      }
    }
  }

  const replaced = new Map<JsonNode, JsonElementNode>();

  for (const [node, keys] of dropped) {
    const kept = Object.fromEntries(
      Object.entries(getDefined(shownOf(node))).filter(
        ([key]) => !keys.has(key)
      )
    );
    const as: readonly AsMember[] =
      Object.keys(kept).length > 0 ? [{ kind: 'as', values: kept }] : [];

    replaced.set(
      node,
      withMembers({ ...node, ...writes.get(node) }, [
        ...readMembers(node).filter((member) => member.kind !== 'as'),
        ...as,
      ]) as JsonElementNode
    );
  }

  const rebuild = rebuildWith(replaced);
  const settled = new Map<
    string,
    Map<number, Readonly<{ after: JsonNode; before: JsonNode }>>
  >();

  for (const { shower } of ready) {
    const { rank } = placeOf(shower.node);
    const ranks = settled.get(shower.root) ?? new Map();

    if (!ranks.has(rank)) {
      ranks.set(rank, { after: rebuild(shower.block), before: shower.block });
    }
    settled.set(shower.root, ranks);
  }

  return settled;
};

/**
 * Where each element of `ready` stands: its block's rank, its own order in
 * the block, and its place. Only the blocks holding one are read.
 */
const placesOf = (
  ready: readonly ReadyShower[],
  indexOf: (root: string) => DocumentIndex
) => {
  const blocks = new Map<string, Set<JsonNode>>();

  for (const { shower } of ready) {
    const inRoot = blocks.get(shower.root) ?? new Set<JsonNode>();

    inRoot.add(shower.block);
    blocks.set(shower.root, inRoot);
  }

  const placed = new Map<
    JsonNode,
    Readonly<{ at: number; place: Place; rank: number }>
  >();

  for (const [root, wanted] of blocks) {
    const index = indexOf(root);
    let left = wanted.size;

    for (let rank = 0; rank < index.size && left > 0; rank += 1) {
      const block = getDefined(index.child(rank));

      if (!wanted.has(block)) continue;
      wanted.delete(block);
      left -= 1;

      let at = 0;
      const visit = (node: JsonNode, place: Place) => {
        placed.set(node, { at, place, rank });
        at += 1;

        const inner: Place = {
          outerTypes: place.parentType
            ? [place.parentType, ...place.outerTypes]
            : place.outerTypes,
          parentType: String(node.type),
          root,
        };

        for (const child of node.children ?? []) {
          if (isElementNode(child)) visit(child, inner);
        }
      };

      visit(block, { outerTypes: [], parentType: null, root });
    }
  }

  return placed;
};
