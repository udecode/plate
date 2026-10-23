import type {
  DocumentIndex,
  IndexedNodeRange,
} from '../../core/change/document-index';
import type { CarriedDrop } from '../../core/change/lineage';
import {
  mapRootChangePositionBackward,
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import type { JsonNode } from '../../core/change/tokens';
import type { PropertyModification } from '../../core/change/transform';
import type { CommandProjection } from '../../core/command-document';
import { carriesDefault } from '../../core/default-storage';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import type { Dependencies } from '../facts/dependencies';
import { isEditingChange } from '../facts/editing';
import { heldProps } from './holds';
import {
  type FormatTag,
  type FormatWriter,
  recordFormats,
  type Standing,
} from './layers';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  isEnclosureChange,
  isUnwrap,
  readAuthoredMarks,
} from './marks';

export type CarriedJudge = Readonly<{
  /**
   * Drops from `index` each value the canonical pass of the plain draft
   * `plain` dropped, where `map` takes its node, when the write rule lets it
   * drop there.
   */
  drops: (
    root: string,
    index: DocumentIndex,
    plain: DocumentIndex,
    drops: readonly CarriedDrop[],
    map: (position: number, assoc: -1 | 1) => number
  ) => RootChange | null;
  /**
   * Drops from each moved copy in `index` the values its place cannot hold
   * that its source, at `from` in the review document before the step,
   * carried as the left-out default. `composed` maps that document back to
   * the stored one.
   */
  copied: (
    root: string,
    index: DocumentIndex,
    composed: RootChange | null,
    copies: readonly MovedCopy[]
  ) => RootChange | null;
  /**
   * Drops each value its place cannot hold from a node the recorded change
   * `composed` kept, under an element whose type it wrote or inside content
   * it wrote, such as a struck letter the plain draft never saw, where the
   * rule lets it drop.
   */
  settle: (
    root: string,
    index: DocumentIndex,
    composed: RootChange
  ) => RootChange | null;
}>;

/**
 * Content a step copied under the writer's insertion, such as a moved block,
 * now at `at`, from `[from, to)` of the review document before the step.
 */
export type MovedCopy = Readonly<{ at: number; from: number; to: number }>;

type Drop = { entry: IndexedNodeRange; keys: Set<string>; node: JsonNode };

// A target reads only the types of a node's ancestors, so of the property
// writes only a type write can move what a descendant holds.
const writesType = (modifications: readonly PropertyModification[]) =>
  modifications.some(({ key }) => key === 'type');

/**
 * The write rule where the review document stores content: a value its place
 * cannot hold drops only when it was the left-out default where the node
 * stood when the command began, and no other pending change has a tag on
 * that key, a type change on the node or an ancestor, or a wrap or unwrap
 * there. A pending join does not count, since the review document keeps the
 * joined content where it was. A drop from the writer's own insertion, such
 * as a moved copy, or in Editing, unsets the key; in Suggesting a kept node
 * takes a removal tag holding the prior value, so rejecting gives it back.
 * Any other value stays, and the recorded document's canonical pass refuses
 * it.
 */
export const carriedJudge = (
  input: Readonly<{
    before: (root: string) => DocumentIndex | null;
    dependencies: Dependencies;
    editing: boolean;
    isOwn: (mark: AuthoredMark) => boolean;
    projection?: CommandProjection;
    schema: CompiledEditorSchema;
    standing: Standing;
    writer: FormatWriter;
  }>
): CarriedJudge => {
  const { dependencies, isOwn, schema } = input;
  const pendingOther = (mark: AuthoredMark) =>
    !isOwn(mark) && !isEditingChange(mark.change);
  const settled = (
    index: DocumentIndex,
    path: readonly number[],
    key: string
  ) => {
    for (let depth = path.length; depth > 0; depth -= 1) {
      const node = index.node(path.slice(0, depth));

      if (
        dependencies
          .marks(node)
          .some(
            (mark) =>
              pendingOther(mark) &&
              (isEnclosureChange(mark) ||
                (mark.kind === 'format' &&
                  (mark.key === 'type' ||
                    (depth === path.length && mark.key === key))))
          )
      ) {
        return false;
      }
    }

    return true;
  };
  const carriedFrom = (
    root: string,
    node: JsonNode,
    key: string,
    at: number | null
  ) => {
    if (at === null) return false;

    const document = input.before(root);
    const entry = document?.nodeStartingAt(at);

    return (
      !!document &&
      entry?.from === at &&
      carriesDefault(schema, { at, document, root }, node, key) &&
      settled(document, entry.path, key)
    );
  };
  const misplaced = (
    index: DocumentIndex,
    entry: IndexedNodeRange,
    root: string
  ): readonly string[] => {
    const node = index.node(entry.path);
    const types: string[] = [];

    // The writer's own pending unwrap lifts the children out of the element
    // the review document still holds.
    for (let depth = entry.path.length - 1; depth > 0; depth -= 1) {
      const ancestor = index.node(entry.path.slice(0, depth));

      if (
        !dependencies
          .marks(ancestor)
          .some((mark) => isUnwrap(mark) && isOwn(mark))
      ) {
        types.push(String(ancestor.type));
      }
    }

    const held = heldProps(schema, node, {
      outerTypes: types.slice(1),
      parentType: types[0] ?? null,
      root,
      text: entry.kind === 'text',
    });

    return held === node
      ? []
      : Object.keys(node).filter((key) => !Object.hasOwn(held, key));
  };
  const ownInsertion = (node: JsonNode) => {
    const inserted = dependencies
      .marks(node)
      .findLast((mark) => mark.kind === 'insert');

    return inserted !== undefined && isOwn(inserted);
  };
  const section = ({ entry, keys, node }: Drop): RootChangeSection => {
    const unset = [...keys];

    if (input.editing || ownInsertion(node)) {
      return { from: entry.from, properties: { unset } };
    }

    const {
      [AUTHORED_MARKS_KEY]: _marks,
      children: _children,
      text: _text,
      ...previous
    } = node;
    const existing = readAuthoredMarks(node).filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    );
    const tags = recordFormats({
      keys: unset,
      next: Object.fromEntries(
        Object.entries(previous).filter(([key]) => !keys.has(key))
      ),
      ownInsertion: false,
      previous,
      source: 'command',
      standing: input.standing,
      tags: existing,
      writer: input.writer,
    });
    const added = tags.filter((tag) => !existing.includes(tag));
    const withdrawn = existing.filter((tag) => !tags.includes(tag));

    return {
      from: entry.from,
      properties: {
        ...(added.length > 0 ? { add: { [AUTHORED_MARKS_KEY]: added } } : {}),
        ...(withdrawn.length > 0
          ? { remove: { [AUTHORED_MARKS_KEY]: withdrawn } }
          : {}),
        unset,
      },
    };
  };
  const changeOf = (index: DocumentIndex, found: ReadonlyMap<number, Drop>) =>
    found.size === 0
      ? null
      : RootChange.create(index, [...found.values()].map(section));
  const add = (
    found: Map<number, Drop>,
    entry: IndexedNodeRange,
    node: JsonNode,
    key: string
  ) => {
    const drop = found.get(entry.from) ?? { entry, keys: new Set(), node };

    drop.keys.add(key);
    found.set(entry.from, drop);
  };

  return {
    drops: (root, index, plain, drops, map) => {
      const found = new Map<number, Drop>();
      const dropAt = (entry: IndexedNodeRange, key: string) => {
        if (misplaced(index, entry, root).includes(key)) {
          add(found, entry, index.node(entry.path), key);
        }
      };

      for (const drop of drops) {
        const source = plain.nodeStartingAt(drop.at);

        if (drop.root !== root || source?.from !== drop.at) continue;

        const formerAt =
          drop.place === null
            ? null
            : input.projection
              ? input.projection.map.toStored(root, drop.place.at, 1)
              : drop.place.at;

        if (!carriedFrom(root, plain.node(source.path), drop.key, formerAt)) {
          continue;
        }

        const from = map(drop.at, 1);

        if (source.kind !== 'text') {
          const entry = index.nodeStartingAt(from);

          if (entry?.from === from) dropAt(entry, drop.key);
          continue;
        }

        // The review document can hold the letters of one plain text in
        // several texts, such as a struck one and the writer's insertion.
        for (let position = from, to = map(source.to, -1); position < to;) {
          const entry = index.nodeStartingAt(position);

          if (entry?.from !== position) {
            position += 1;
          } else if (entry.kind === 'text') {
            dropAt(entry, drop.key);
            position = entry.to;
          } else {
            position = entry.contentFrom;
          }
        }
      }

      return changeOf(index, found);
    },
    copied: (root, index, composed, copies) => {
      const found = new Map<number, Drop>();

      for (const { at, from, to } of copies) {
        for (let offset = 0; offset < to - from;) {
          const entry = index.nodeStartingAt(at + offset);

          if (entry?.from !== at + offset) {
            offset += 1;
            continue;
          }

          const keys = misplaced(index, entry, root);

          if (keys.length > 0) {
            const node = index.node(entry.path);
            const formerAt = composed
              ? mapRootChangePositionBackward(
                  composed,
                  from + offset,
                  1,
                  'after'
                )
              : from + offset;

            for (const key of keys) {
              if (carriedFrom(root, node, key, formerAt)) {
                add(found, entry, node, key);
              }
            }
          }
          offset = (entry.kind === 'text' ? entry.to : entry.contentFrom) - at;
        }
      }

      return changeOf(index, found);
    },
    settle: (root, index, composed) => {
      const kept: Array<readonly [number, number]> = [];
      const ranges: Array<readonly [number, number, boolean]> = [];
      const { data, sections } = composed;

      for (let at = 0, position = 0; at < sections.length; at += 2) {
        const length = sections[at] ?? 0;
        const inserted = sections[at + 1] ?? 0;
        const written = inserted < 0 ? length : inserted;

        if (inserted < 0) kept.push([position, position + length]);
        if (inserted !== -1) {
          ranges.push([
            position,
            position + written,
            inserted >= 0 ||
              writesType(data[at / 2] as readonly PropertyModification[]),
          ]);
        }
        position += written;
      }

      // The walk visits positions in order, so one cursor reads the kept runs.
      let run = 0;
      const isKept = (position: number) => {
        while (run < kept.length && (kept[run]?.[1] ?? 0) <= position) {
          run += 1;
        }

        return (kept[run]?.[0] ?? Number.POSITIVE_INFINITY) <= position;
      };
      const splitRestSource = (entry: IndexedNodeRange) => {
        if (entry.kind !== 'text' || !isKept(entry.contentTo)) return null;

        const close = mapRootChangePositionBackward(
          composed,
          entry.contentTo,
          1
        );

        return close === null
          ? null
          : (input.before(root)?.openContextAt(close).at(-1)?.from ?? null);
      };
      const found = new Map<number, Drop>();
      let scanned = 0;

      for (const [from, to, inward] of ranges) {
        let position = Math.max(from, scanned);
        let end = to;
        const inner = index.openContextAt(position).at(-1);

        if (inner?.kind === 'text' && inner.from < position) {
          position = inner.to;
        }
        while (position < end) {
          const entry = index.nodeStartingAt(position);

          if (entry?.from !== position) {
            position += 1;
            continue;
          }

          const keys = misplaced(index, entry, root);
          const node = index.node(entry.path);

          if (keys.length > 0 && !ownInsertion(node)) {
            const formerAt = isKept(position)
              ? mapRootChangePositionBackward(composed, position, 1)
              : splitRestSource(entry);

            for (const key of keys) {
              if (carriedFrom(root, node, key, formerAt ?? null)) {
                add(found, entry, node, key);
              }
            }
          }
          if (entry.kind === 'text') {
            position = entry.to;
          } else {
            if (inward) end = Math.max(end, entry.to);
            position = entry.contentFrom;
          }
        }
        scanned = Math.max(scanned, end);
      }

      return changeOf(index, found);
    },
  };
};
