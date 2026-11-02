import * as Y from 'yjs';

import { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  propertyDeltaFromModifications,
  RootChange,
  type RootChangeSection,
  semanticPropertyModifications,
} from '../../core/change/root-change';
import {
  isTextNode,
  type JsonNode,
  type JsonTextNode,
} from '../../core/change/tokens';
import type { Descendant } from '../../index';
import type { YjsNode } from './attributes';
import { getYjsVisibleChildren } from './document';
import { YJS_CUT_KEY } from './keys';
import { alignYjsChildren, textPieceOf } from './text-runs';

/** Keep, delete or insert `count` letters. */
type LetterStep = readonly [kind: 'delete' | 'insert' | 'keep', count: number];

/**
 * How the letters of one text run went from before a batch to after it, as
 * Yjs says: which it kept, deleted and inserted, in order.
 */
export type LetterScript = readonly LetterStep[];

type TextDelta = ReadonlyArray<
  Readonly<{ delete?: number; insert?: unknown; retain?: number }>
>;

const pushStep = (steps: LetterStep[], kind: LetterStep[0], count: number) => {
  if (count === 0) return;

  const top = steps.at(-1);

  if (top?.[0] === kind) steps[steps.length - 1] = [kind, top[1] + count];
  else steps.push([kind, count]);
};

const INSERTED = -1;
const INSERTED_CUT = -2;

/**
 * A source text after a batch, by Yjs index: the index before the batch of
 * each letter or cut it kept, `INSERTED` for a letter it inserted and
 * `INSERTED_CUT` for a cut it inserted, with the source's length before.
 */
type SourceLetters = Readonly<{ after: readonly number[]; length: number }>;

const isCutInsert = (insert: unknown) =>
  typeof insert === 'object' &&
  insert !== null &&
  (insert as Record<string, unknown>)[YJS_CUT_KEY] === 1;

/**
 * Composes a source's deltas in the order Yjs made them. Null for a delta
 * that inserts an embed other than a cut.
 */
const composeSource = (
  deltas: readonly TextDelta[],
  length: number
): SourceLetters | null => {
  let before = length;

  for (const delta of deltas) {
    for (const part of delta) {
      if (part.delete !== undefined) before += part.delete;
      else if (typeof part.insert === 'string') before -= part.insert.length;
      else if (part.insert !== undefined) before -= 1;
    }
  }

  let after = Array.from({ length: before }, (_, index) => index);

  for (const delta of deltas) {
    const next: number[] = [];
    let at = 0;
    // A spread passes each letter as an argument, which overflows the call
    // stack on a long line.
    const keep = (end: number) => {
      for (let index = at; index < Math.min(end, after.length); index += 1) {
        next.push(after[index]);
      }
      at = end;
    };

    for (const part of delta) {
      if (part.retain !== undefined) {
        keep(at + part.retain);
      } else if (part.delete !== undefined) {
        at += part.delete;
      } else if (typeof part.insert === 'string') {
        // One mark per UTF-16 unit, as Yjs counts them.
        const start = next.length;
        next.length = start + part.insert.length;
        next.fill(INSERTED, start);
      } else if (isCutInsert(part.insert)) {
        next.push(INSERTED_CUT);
      } else {
        return null;
      }
    }
    keep(after.length);
    after = next;
  }

  return after.length === length ? { after, length: before } : null;
};

/**
 * Where the letters before the batch that the piece starting or ending at
 * the cut `at` holds start or end. A letter deleted right before a cut the
 * batch inserted belongs to the piece before it.
 */
const beforeBoundary = (letters: SourceLetters, at: number) => {
  if (at >= letters.after.length) return letters.length;

  const cut = letters.after[at];

  if (cut >= 0) return cut;
  for (let index = at + 1; index < letters.after.length; index++) {
    if (letters.after[index] >= 0) return letters.after[index];
  }

  return letters.length;
};

/**
 * The script of the letters `[from, to)` of a source, a piece between two
 * cuts or its ends. Null when a letter of the piece came from outside its
 * letters before.
 */
const pieceScript = (
  letters: SourceLetters,
  from: number,
  to: number
): LetterScript | null => {
  const steps: LetterStep[] = [];
  const cut = from === 0 ? null : letters.after[from - 1];
  let kept =
    cut === null ? 0 : cut >= 0 ? cut + 1 : beforeBoundary(letters, from - 1);
  const end = beforeBoundary(letters, to);

  for (let at = from; at < to; at++) {
    const entry = letters.after[at];

    if (entry === INSERTED) {
      pushStep(steps, 'insert', 1);
      continue;
    }
    if (entry < kept || entry >= end) return null;
    pushStep(steps, 'delete', entry - kept);
    pushStep(steps, 'keep', 1);
    kept = entry + 1;
  }
  if (kept > end) return null;
  pushStep(steps, 'delete', end - kept);

  return steps;
};

/** What a batch says about the Yjs nodes a line shows. */
export type LetterBatch = Readonly<{
  deltas: ReadonlyMap<Y.XmlText, readonly TextDelta[]>;
  inserted: ReadonlySet<YjsNode>;
  /** Nodes whose children or what they show the batch changed. */
  reshaped: ReadonlySet<unknown>;
  /** Each source's composed letters, read once per batch. */
  sources: Map<Y.XmlText, SourceLetters | null>;
}>;

const lettersOf = (batch: LetterBatch, source: Y.XmlText) => {
  if (!batch.sources.has(source)) {
    batch.sources.set(
      source,
      composeSource(batch.deltas.get(source) ?? [], source.length)
    );
  }

  return batch.sources.get(source) ?? null;
};

/**
 * Each text run's script for the line `node` shows as `line`, in document
 * order. A text the batch inserted holds only new letters, unless it shows
 * letters of an older source after a cut. Null when the batch changed the
 * children of an element the line held before or what a node shows, since
 * the line's letters then cannot be read text by text.
 */
export const readLineScripts = (
  root: Y.XmlElement,
  node: YjsNode,
  line: Descendant,
  batch: LetterBatch,
  reshapes = false
): LetterScript[] | null => {
  const scripts: LetterScript[] = [];
  // Where each source's letters read so far end, so a line read through
  // reshaped elements still shows each source's letters in order.
  const ends = new Map<Y.XmlText, number>();
  const walk = (element: YjsNode, value: Descendant): boolean => {
    if (
      !(element instanceof Y.XmlElement) ||
      isTextNode(value) ||
      (!reshapes && batch.reshaped.has(element))
    ) {
      return false;
    }

    const aligned = alignYjsChildren(
      (value as { children: readonly Descendant[] }).children,
      getYjsVisibleChildren(root, element)
    );

    if (!aligned) return false;

    return aligned.segments.every((segment, order) => {
      const target = aligned.targets[order];

      if (segment.kind === 'element') {
        return target?.kind === 'element' && walk(target.node, segment.node);
      }
      if (target === null) {
        scripts.push([]);

        return true;
      }
      if (target?.kind !== 'text') return false;

      const steps: LetterStep[] = [];

      for (const text of target.chain) {
        if (!reshapes && batch.reshaped.has(text)) return false;

        const { from, source, to } = textPieceOf(text);
        const inserted = batch.inserted.has(source);
        const letters = inserted ? null : lettersOf(batch, source);
        const script = inserted
          ? [['insert', to - from] as const]
          : letters && pieceScript(letters, from, to);

        if (!script) return false;
        if (reshapes && letters) {
          const start = from === 0 ? 0 : beforeBoundary(letters, from - 1);
          const end = ends.get(source);

          if (end !== undefined && start !== end) return false;
          ends.set(source, beforeBoundary(letters, to));
        }
        for (const [kind, count] of script) pushStep(steps, kind, count);
      }
      scripts.push(steps);

      return true;
    });
  };

  return walk(node, line) ? scripts : null;
};

/** The scripts of a line whose letters a caller already made: it keeps them all. */
export const keptScriptsOf = (line: JsonNode): LetterScript[] =>
  segmentsOf(line).flatMap((segment) =>
    segment.kind === 'element'
      ? keptScriptsOf(segment.node)
      : [
          [
            [
              'keep',
              segment.leaves.reduce((sum, leaf) => sum + leaf.text.length, 0),
            ] as const,
          ],
        ]
  );

const lineItemsOf = (line: JsonNode) => {
  const items: Array<
    Readonly<{
      kind: 'close' | 'letter' | 'open';
      letter?: string;
      node: JsonNode;
      position: number;
    }>
  > = [];
  const letters: number[] = [];
  let position = 0;
  const walk = (node: JsonNode) => {
    items.push({ kind: 'open', node, position });
    position += 1;
    if (isTextNode(node)) {
      for (const letter of node.text.split('')) {
        letters.push(items.length);
        items.push({ kind: 'letter', letter, node, position });
        position += 1;
      }
    } else {
      for (const child of node.children ?? []) walk(child);
    }
    items.push({ kind: 'close', node, position });
    position += 1;
  };

  walk(line);

  return { items, letters };
};

/**
 * The anchors of a line whose elements changed, such as by a wrap or an
 * unwrap, from `script`, the script of all its letters in document order.
 * Kept letters keep their tokens; around them the rule of a text run pairs
 * the boundaries, so a wrap reads as the element's tokens inserted around
 * kept letters. Null when the script does not fit the line.
 */
const flatLineAnchors = (
  before: JsonNode,
  after: JsonNode,
  script: LetterScript
): Anchor[] | null => {
  const left = lineItemsOf(before);
  const right = lineItemsOf(after);
  const kept: Array<readonly [number, number]> = [];
  let beforeLetter = 0;
  let afterLetter = 0;

  for (const [kind, count] of script) {
    if (kind === 'keep') {
      for (let index = 0; index < count; index++) {
        kept.push([
          left.letters[beforeLetter + index],
          right.letters[afterLetter + index],
        ]);
      }
    }
    if (kind !== 'insert') beforeLetter += count;
    if (kind !== 'delete') afterLetter += count;
  }
  if (
    beforeLetter !== left.letters.length ||
    afterLetter !== right.letters.length ||
    kept.some(([b, a]) => left.items[b]?.letter !== right.items[a]?.letter)
  ) {
    return null;
  }

  const anchors: Anchor[] = [];
  const pair = (b: number, a: number) => {
    const previous = anchors.at(-1);
    const leftItem = left.items[b];
    const rightItem = right.items[a];

    if (
      !leftItem ||
      !rightItem ||
      leftItem.kind !== rightItem.kind ||
      (previous &&
        (leftItem.position <= previous.before ||
          rightItem.position <= previous.after))
    ) {
      return;
    }
    anchors.push({
      after: rightItem.position,
      before: leftItem.position,
      ...(leftItem.kind === 'open'
        ? { opens: [leftItem.node, rightItem.node] as const }
        : {}),
    });
  };
  const lastOpen = (items: typeof left.items, from: number, to: number) => {
    for (let index = to - 1; index >= from; index--) {
      if (items[index].kind === 'open') return index;
    }

    return -1;
  };
  const firstClose = (items: typeof left.items, from: number, to: number) => {
    for (let index = from; index < to; index++) {
      if (items[index].kind === 'close') return index;
    }

    return -1;
  };

  pair(0, 0);
  for (const [index, [b, a]] of kept.entries()) {
    const [previousB, previousA] = index === 0 ? [0, 0] : kept[index - 1];
    const closeB = index === 0 ? -1 : firstClose(left.items, previousB + 1, b);
    const closeA = index === 0 ? -1 : firstClose(right.items, previousA + 1, a);

    if (closeB !== -1 && closeA !== -1) pair(closeB, closeA);
    pair(
      lastOpen(left.items, previousB + 1, b),
      lastOpen(right.items, previousA + 1, a)
    );
    pair(b, a);
  }

  const tail = kept.at(-1);

  if (tail) {
    pair(
      firstClose(left.items, tail[0] + 1, left.items.length),
      firstClose(right.items, tail[1] + 1, right.items.length)
    );
  }
  pair(left.items.length - 1, right.items.length - 1);

  const end = anchors.at(-1);

  return end?.before === left.items.length - 1 &&
    end.after === right.items.length - 1
    ? anchors
    : null;
};

type Anchor = Readonly<{
  after: number;
  before: number;
  /** The nodes whose open tokens these are, when their properties differ. */
  opens?: readonly [JsonNode, JsonNode];
}>;

type Item = Readonly<{
  kind: 'close' | 'letter' | 'open';
  leaf: JsonTextNode;
  letter?: string;
  position: number;
}>;

const itemsOf = (leaves: readonly JsonTextNode[], from: number) => {
  const items: Item[] = [];
  const letters: number[] = [];
  let position = from;

  for (const leaf of leaves) {
    items.push({ kind: 'open', leaf, position });
    position += 1;
    // Yjs and tokens both count UTF-16 units, as split('') splits.
    for (const letter of leaf.text.split('')) {
      letters.push(items.length);
      items.push({ kind: 'letter', leaf, letter, position });
      position += 1;
    }
    items.push({ kind: 'close', leaf, position });
    position += 1;
  }

  return { end: position, items, letters };
};

/**
 * Where each side of a text run's script keeps a token. Kept letters keep
 * theirs. Around them, Yjs says nothing of leaves, so one rule pairs their
 * boundaries: before the first kept letter the last open, after the last
 * kept letter the first close, and between two kept letters, when both sides
 * hold a boundary there, the first close and the last open. A run that keeps
 * no letter pairs its first open and its last close. Everything else between
 * two anchors is replaced. Null when the script does not fit the run.
 */
const runAnchors = (
  before: readonly JsonTextNode[],
  after: readonly JsonTextNode[],
  script: LetterScript,
  start: Readonly<{ after: number; before: number }>
) => {
  const left = itemsOf(before, start.before);
  const right = itemsOf(after, start.after);
  const kept: Array<readonly [number, number]> = [];
  let beforeLetter = 0;
  let afterLetter = 0;

  for (const [kind, count] of script) {
    if (kind === 'keep') {
      for (let index = 0; index < count; index++) {
        kept.push([
          left.letters[beforeLetter + index],
          right.letters[afterLetter + index],
        ]);
      }
    }
    if (kind !== 'insert') beforeLetter += count;
    if (kind !== 'delete') afterLetter += count;
  }
  if (
    beforeLetter !== left.letters.length ||
    afterLetter !== right.letters.length ||
    kept.some(([b, a]) => left.items[b]?.letter !== right.items[a]?.letter)
  ) {
    return null;
  }

  const anchors: Anchor[] = [];
  const pair = (b: number, a: number) => {
    const leftItem = left.items[b];
    const rightItem = right.items[a];

    anchors.push({
      after: rightItem.position,
      before: leftItem.position,
      ...(leftItem.kind === 'open'
        ? { opens: [leftItem.leaf, rightItem.leaf] as const }
        : {}),
    });
  };
  const lastOpen = (items: readonly Item[], from: number, to: number) => {
    for (let index = to - 1; index >= from; index--) {
      if (items[index].kind === 'open') return index;
    }

    return -1;
  };
  const firstClose = (items: readonly Item[], from: number, to: number) => {
    for (let index = from; index < to; index++) {
      if (items[index].kind === 'close') return index;
    }

    return -1;
  };

  const tail = kept.at(-1);

  if (!tail) {
    pair(0, 0);
    pair(left.items.length - 1, right.items.length - 1);

    return { anchors, end: { after: right.end, before: left.end } };
  }

  const [headB, headA] = kept[0];

  pair(lastOpen(left.items, 0, headB), lastOpen(right.items, 0, headA));
  kept.forEach(([b, a], index) => {
    if (index > 0) {
      const [previousB, previousA] = kept[index - 1];
      const closeB = firstClose(left.items, previousB + 1, b);
      const closeA = firstClose(right.items, previousA + 1, a);

      if (closeB !== -1 && closeA !== -1) {
        pair(closeB, closeA);
        pair(
          lastOpen(left.items, closeB + 1, b),
          lastOpen(right.items, closeA + 1, a)
        );
      }
    }
    pair(b, a);
  });

  const [tailB, tailA] = tail;

  pair(
    firstClose(left.items, tailB + 1, left.items.length),
    firstClose(right.items, tailA + 1, right.items.length)
  );

  return { anchors, end: { after: right.end, before: left.end } };
};

type Segment =
  | Readonly<{ kind: 'element'; node: JsonNode }>
  | Readonly<{ kind: 'text'; leaves: readonly JsonTextNode[] }>;

const segmentsOf = (node: JsonNode): Segment[] => {
  const segments: Segment[] = [];

  for (const child of node.children ?? []) {
    if (!isTextNode(child)) {
      segments.push({ kind: 'element', node: child });
      continue;
    }

    const top = segments.at(-1);

    if (top?.kind === 'text') {
      segments[segments.length - 1] = {
        kind: 'text',
        leaves: [...top.leaves, child],
      };
    } else segments.push({ kind: 'text', leaves: [child] });
  }

  return segments;
};

const tokenLength = (node: JsonNode): number =>
  isTextNode(node)
    ? node.text.length + 2
    : (node.children ?? []).reduce((sum, child) => sum + tokenLength(child), 2);

/**
 * The anchors of a line whose elements match on both sides, its text runs
 * placed by `scripts` in document order. Null when the elements differ or a
 * script does not fit its run.
 */
const lineAnchors = (
  before: JsonNode,
  after: JsonNode,
  scripts: readonly LetterScript[]
): Anchor[] | null => {
  const anchors: Anchor[] = [];
  let script = 0;
  const walk = (left: JsonNode, right: JsonNode, at: Anchor): boolean => {
    const leftSegments = segmentsOf(left);
    const rightSegments = segmentsOf(right);

    if (leftSegments.length !== rightSegments.length) return false;

    anchors.push({ ...at, opens: [left, right] });

    let position = { after: at.after + 1, before: at.before + 1 };

    for (const [index, segment] of leftSegments.entries()) {
      const other = rightSegments[index];

      if (segment.kind === 'element') {
        if (
          other.kind !== 'element' ||
          !walk(segment.node, other.node, position)
        ) {
          return false;
        }
        position = {
          after: position.after + tokenLength(other.node),
          before: position.before + tokenLength(segment.node),
        };
        continue;
      }
      if (other.kind !== 'text' || script >= scripts.length) return false;

      const run = runAnchors(
        segment.leaves,
        other.leaves,
        scripts[script],
        position
      );

      script += 1;
      if (!run) return false;
      for (const anchor of run.anchors) anchors.push(anchor);
      position = run.end;
    }
    anchors.push(position);

    return true;
  };

  return walk(before, after, { after: 0, before: 0 }) &&
    script === scripts.length
    ? anchors
    : null;
};

/**
 * The change of the lines `before` into `after`, one to one, each changed
 * line built from its scripts: it keeps the letters Yjs kept, and a kept
 * leaf whose marks changed changes only its properties. `scriptsOf` gives a
 * changed line's scripts, or null when the batch cannot name them. Null when
 * any changed line has none or its scripts do not rebuild it.
 */
export const linesChangeByLetters = (
  before: readonly JsonNode[],
  after: readonly JsonNode[],
  scriptsOf: (index: number) => readonly LetterScript[] | null,
  isSetValued: (node: JsonNode, key: string) => boolean
): RootChange | null => {
  if (before.length !== after.length) return null;

  const document = DocumentIndex.fromValue(before);
  const sections: RootChangeSection[] = [];
  let lineFrom = 0;

  for (const [index, left] of before.entries()) {
    const right = after[index];

    if (left !== right && !jsonEqual(left, right)) {
      const scripts = scriptsOf(index);
      const anchors =
        scripts &&
        (lineAnchors(left, right, scripts) ??
          flatLineAnchors(left, right, scripts.flat()));

      if (!anchors) return null;

      const target = DocumentIndex.fromValue([right]);
      let previous = { after: -1, before: -1 };

      for (const anchor of anchors) {
        if (
          anchor.before > previous.before + 1 ||
          anchor.after > previous.after + 1
        ) {
          sections.push({
            from: lineFrom + previous.before + 1,
            insert: target.slice(previous.after + 1, anchor.after),
            to: lineFrom + anchor.before,
          });
        }

        const { opens } = anchor;
        const modifications = opens
          ? semanticPropertyModifications(opens[0], opens[1], (key) =>
              isSetValued(opens[0], key)
            )
          : [];

        if (modifications.length > 0) {
          sections.push({
            from: lineFrom + anchor.before,
            properties: propertyDeltaFromModifications(modifications),
          });
        }
        previous = anchor;
      }
    }
    lineFrom += tokenLength(left);
  }

  const change = RootChange.create(document, sections);

  return jsonEqual(change.apply(document).value, after) ? change : null;
};
