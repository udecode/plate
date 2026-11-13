import {
  type DocumentChange,
  valueRootIndex,
} from '../../core/change/document-change';
import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonEditorValue } from '../../core/change/tokens';

export type LaterEntry = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  writer: string;
}>;

/** The top-level blocks `start` to `end`, `end` excluded, of one root. */
export type BlockWindow = Readonly<{
  end: number;
  root: string;
  start: number;
}>;

export type WindowWalk =
  | 'crossed'
  | Readonly<{
      /** Each window where it sits in the last entry's result. */
      windows: readonly BlockWindow[];
      /** The writers whose entries changed a block inside a window or inserted one right next to it. */
      writers: ReadonlySet<string>;
    }>;

type Span = Readonly<{
  after: readonly [number, number];
  before: readonly [number, number];
}>;

const rootOf = (root: string | null) => root ?? 'main';

const blockAt = (index: DocumentIndex, position: number) => {
  let low = 0;
  let high = index.size;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (index.childPosition([], middle) <= position) low = middle;
    else high = middle - 1;
  }

  return low;
};

// A range inside a block covers that block; a range between two blocks
// covers none, so an insert there spans no block before it.
const blocksOf = (
  index: DocumentIndex,
  from: number,
  to: number
): readonly [number, number] => {
  const last = blockAt(index, to);

  return [
    blockAt(index, from),
    to === index.childPosition([], last) ? last : last + 1,
  ];
};

const spansOf = (
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const spans = new Map<string, Span[]>();

  change.iterChangedRanges((name, fromA, toA, fromB, toB) => {
    const root = rootOf(name);
    const list = spans.get(root) ?? [];

    list.push({
      after: blocksOf(valueRootIndex(after, root), fromB, toB),
      before: blocksOf(valueRootIndex(before, root), fromA, toA),
    });
    spans.set(root, list);
  });

  return spans;
};

export const windowsOf = (
  entry: Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    change: DocumentChange;
  }>
) =>
  [...spansOf(entry.change, entry.before, entry.after)].map(
    ([root, spans]) => ({
      after: {
        end: Math.max(...spans.map(({ after }) => after[1])),
        root,
        start: Math.min(...spans.map(({ after }) => after[0])),
      },
      before: {
        end: Math.max(...spans.map(({ before }) => before[1])),
        root,
        start: Math.min(...spans.map(({ before }) => before[0])),
      },
    })
  );

const isInside = ({ end, start }: BlockWindow, [from, to]: Span['before']) =>
  start <= from && to <= end;

const moved = (
  window: BlockWindow,
  spans: readonly Span[],
  sizes: Readonly<{ after: number; before: number }>
): BlockWindow | null => {
  const { end, root, start } = window;
  let lead: Span | undefined;
  let trail: Span | undefined;

  for (const span of spans) {
    const [from, to] = span.before;

    if (isInside(window, span.before)) continue;
    if (to <= start) {
      if (!lead || to >= lead.before[1]) lead = span;
    } else if (from >= end) {
      if (!trail || from < trail.before[0]) trail = span;
    } else {
      return null;
    }
  }

  const first = lead ? lead.after[1] + (start - lead.before[1]) : start;
  const last = trail
    ? trail.after[0] - (trail.before[0] - end)
    : sizes.after - (sizes.before - end);

  return first <= last ? { end: last, root, start: first } : null;
};

/**
 * Where each window sits after `later`, read from each entry's change, never
 * from its documents alone, so a block replaced with the same bytes still
 * counts as changed. `'crossed'` when an entry changed a range across a
 * window's edge or removed or created its root.
 */
export const walkWindow = (
  windows: readonly BlockWindow[],
  later: readonly LaterEntry[]
): WindowWalk => {
  let current = windows;
  const writers = new Set<string>();

  for (const { after, before, change, writer } of later) {
    const spans = spansOf(change, before, after);
    const next: BlockWindow[] = [];

    for (const window of current) {
      if (
        change.createRoots.has(window.root) ||
        change.deleteRoots.has(window.root)
      ) {
        return 'crossed';
      }

      const list = spans.get(window.root) ?? [];
      const walked = moved(window, list, {
        after: valueRootIndex(after, window.root).size,
        before: valueRootIndex(before, window.root).size,
      });

      if (!walked) return 'crossed';
      if (list.some((span) => isInside(window, span.before))) {
        writers.add(writer);
      }
      next.push(walked);
    }
    current = next;
  }

  return { windows: current, writers };
};
