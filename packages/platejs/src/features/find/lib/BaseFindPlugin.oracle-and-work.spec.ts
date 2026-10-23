import { describe, expect, it, spyOn } from 'bun:test';

import {
  BaseParagraphPlugin,
  createEditor,
  createEditorView,
  definePlugin,
  type Descendant,
  NodeApi,
  type NodeKey,
  type Path,
  PathApi,
  type Point,
  type Range,
  schema,
  TextApi,
} from '../../../core';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import { BaseBoldPlugin } from '../../basic-nodes/lib/BaseMarkPlugins';
import { BaseLinkPlugin } from '../../link';
import { BaseFindPlugin } from './BaseFindPlugin';

const QUERY = 'hello';

const editedValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'say hel' },
      {
        type: 'link',
        url: 'https://platejs.org',
        children: [{ text: 'lo there' }],
      },
      { text: ' and hello' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'he' },
      { bold: true, text: 'llo bold hel' },
      { text: 'lo' },
    ],
  },
  { type: 'paragraph', children: [{ text: 'nothing here' }] },
  { type: 'paragraph', children: [{ text: 'hello hello' }] },
  { type: 'paragraph', children: [{ text: 'tail hello' }] },
];

const insertedBlocks = [
  { type: 'paragraph', children: [{ text: 'new hello' }] },
  { type: 'paragraph', children: [{ text: 'plain' }] },
  {
    type: 'paragraph',
    children: [
      { text: 'hel' },
      { type: 'link', url: 'https://platejs.org', children: [{ text: 'lo' }] },
      { text: ' linked' },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'bold ' }, { bold: true, text: 'hello' }],
  },
];

const fragments = ['hello', 'hel', 'lo', 'l', 'x', ' ', 'HeLLo', 'o h'];

const FindEmptyInline = definePlugin('findEmptyInline', {
  schema: {
    element: { inline: true, content: schema.content.text({ max: 0 }) },
  },
});

const FindEmptyBlock = definePlugin('findEmptyBlock', {
  schema: { element: { content: schema.content.text({ max: 0 }) } },
});

// Holds text, inline elements and blocks side by side, so a text run ends at
// each block inside it.
const FindMixed = definePlugin('findMixed', {
  schema: {
    element: {
      content: schema.content.any([
        schema.content.text(),
        schema.content.type('link'),
        schema.content.type('findEmptyInline'),
        schema.content.type('findEmptyBlock'),
        schema.content.type('paragraph'),
        schema.content.type('findMixed'),
      ]),
    },
  },
});

const createFindEditor = (initialValue: readonly Descendant[] = editedValue) =>
  createEditor({
    initialValue: [...initialValue] as never,
    plugins: [
      BaseFindPlugin,
      BaseLinkPlugin,
      BaseBoldPlugin,
      FindEmptyInline,
      FindEmptyBlock,
      FindMixed,
    ],
  });

type FindEditor = ReturnType<typeof createFindEditor>;

const createRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const textEntries = (
  children: readonly Descendant[],
  parent: Path = []
): Array<{ length: number; path: Path }> =>
  children.flatMap((node, index) => {
    const path = [...parent, index];

    return TextApi.isText(node)
      ? [{ length: node.text.length, path }]
      : textEntries(node.children, path);
  });

const commitKinds = [
  'insert text',
  'insert text',
  'insert text',
  'delete text',
  'delete across',
  'split',
  'merge',
  'insert block',
  'remove block',
  'move block',
  'undo',
  'redo',
] as const;

const flatText = (children: readonly Descendant[]) =>
  children.map((block) => NodeApi.string(block)).join('\n');

const blockStart = (children: readonly Descendant[], block: number) =>
  children
    .slice(0, block)
    .reduce((offset, node) => offset + NodeApi.string(node).length + 1, 0);

const flatOffset = (children: readonly Descendant[], point: Point) => {
  const block = point.path[0];
  let offset = blockStart(children, block) + point.offset;

  for (const entry of textEntries(children)) {
    if (PathApi.equals(entry.path, point.path)) return offset;
    if (entry.path[0] === block) offset += entry.length;
  }

  throw new Error(`No text at ${JSON.stringify(point.path)}`);
};

type FlatRange = { end: number; start: number };

const flatRange = (
  children: readonly Descendant[],
  range: Range
): FlatRange => {
  const [start, end] = [
    flatOffset(children, range.anchor),
    flatOffset(children, range.focus),
  ].sort((a, b) => a - b);

  return { end, start };
};

type FlatChange = { at: number; text: string } | { from: number; to: number };

const applyChange = (text: string, change: FlatChange) =>
  'text' in change
    ? text.slice(0, change.at) + change.text + text.slice(change.at)
    : text.slice(0, change.from) + text.slice(change.to);

const mapThrough = (range: FlatRange, change: FlatChange): FlatRange => {
  if ('text' in change) {
    const grow = change.text.length;

    return {
      end: change.at < range.end ? range.end + grow : range.end,
      start: change.at <= range.start ? range.start + grow : range.start,
    };
  }

  const map = (offset: number) =>
    offset <= change.from
      ? offset
      : offset >= change.to
        ? offset - (change.to - change.from)
        : change.from;

  return { end: map(range.end), start: map(range.start) };
};

const commitRandomEdit = (editor: FindEditor, random: () => number) => {
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(random() * items.length)];
  const children = editor.read.children();
  const texts = textEntries(children);
  const blocks = children.length;
  const point = (entry = pick(texts)) => ({
    offset: Math.floor(random() * (entry.length + 1)),
    path: entry.path,
  });
  const kind = pick(commitKinds);
  let change: FlatChange | null = null;

  if (kind === 'insert text') {
    const text = pick(fragments);
    const at = point();

    change = { at: flatOffset(children, at), text };
    editor.update.text.insert(text, { at });
  } else if (kind === 'delete text') {
    const entry = pick(texts);
    const [start, end] = [point(entry).offset, point(entry).offset].sort(
      (a, b) => a - b
    );
    const at = {
      anchor: { offset: start, path: entry.path },
      focus: { offset: end, path: entry.path },
    };
    const { end: to, start: from } = flatRange(children, at);

    change = { from, to };
    editor.update.text.delete({ at });
  } else if (kind === 'delete across') {
    const index = Math.floor(random() * texts.length);
    const last = Math.min(
      texts.length - 1,
      index + 1 + Math.floor(random() * 2)
    );
    const at = { anchor: point(texts[index]), focus: point(texts[last]) };
    const { end: to, start: from } = flatRange(children, at);

    change = { from, to };
    editor.update.text.delete({ at });
  } else if (kind === 'split') {
    const at = point();

    change = { at: flatOffset(children, at), text: '\n' };
    editor.update.nodes.split({ always: true, at });
  } else if (kind === 'merge' && blocks > 1) {
    const at = 1 + Math.floor(random() * (blocks - 1));
    const start = blockStart(children, at);

    change = { from: start - 1, to: start };
    editor.update.nodes.merge({ at: [at] });
  } else if (kind === 'insert block') {
    const block = structuredClone(pick(insertedBlocks));
    const at = Math.floor(random() * (blocks + 1));
    const text = NodeApi.string(block);

    change =
      at < blocks
        ? { at: blockStart(children, at), text: `${text}\n` }
        : { at: flatText(children).length, text: `\n${text}` };
    editor.update.nodes.insert(block, { at: [at] });
  } else if (kind === 'remove block' && blocks > 1) {
    const at = Math.floor(random() * blocks);

    change =
      at < blocks - 1
        ? { from: blockStart(children, at), to: blockStart(children, at + 1) }
        : {
            from: blockStart(children, at) - 1,
            to: flatText(children).length,
          };
    editor.update.nodes.remove({ at: [at] });
  } else if (kind === 'move block' && blocks > 1) {
    const at = Math.floor(random() * blocks);
    const to = Math.floor(random() * blocks);

    if (at !== to) editor.update.nodes.move({ at: [at], to: [to] });
  } else if (kind === 'undo') {
    editor.api.history.undo();
  } else if (kind === 'redo') {
    editor.api.history.redo();
  }

  const modeled =
    change !== null &&
    applyChange(flatText(children), change) ===
      flatText(editor.read.children());

  return { change: modeled ? change : null, kind };
};

const searchAgain = (reference: FindEditor, editor: FindEditor) => {
  const find = reference.plugin(BaseFindPlugin);

  find.api.search('');
  reference.update.value.replace({ children: editor.read.children() });
  find.api.search(QUERY);

  return reference;
};

const ranges = (editor: FindEditor) =>
  editor
    .plugin(BaseFindPlugin)
    .store.get('matches')
    .map((match) => match.range);

const painted = (editor: FindEditor) => {
  const [source] = getPlateDecorationSources(editor);

  return textEntries(editor.read.children()).map(({ path }) => ({
    decorations: source
      .read({ editor, entry: editor.read.nodes.get(path)! })
      .map(({ attributes, range }) => ({
        active: attributes?.['data-find-active'] !== undefined,
        match: attributes?.['data-find-match'] !== undefined,
        range,
      })),
    path,
  }));
};

const SEEDS = Array.from({ length: 10 }, (_, index) => 7919 * (index + 1));
const COMMITS_PER_SEED = 25;
const MIN_COMMITS_COMPARED = 200;
const MIN_COUNT_CHANGES = 60;
const JUDGED_FLOOR = 150;
const FALLBACK_FLOOR = 5;

describe('find results through random edits', () => {
  it('match the matches, count and paint of a fresh search after every commit', () => {
    const failures: string[] = [];
    const ran = new Set<string>();
    let compared = 0;
    let countChanges = 0;

    for (const seed of SEEDS) {
      const random = createRandom(seed);
      const editor = createFindEditor();
      const reference = createFindEditor();
      const find = editor.plugin(BaseFindPlugin);

      find.api.search(QUERY);

      for (let step = 0; step < COMMITS_PER_SEED; step += 1) {
        const before = find.store.get('count');
        const { kind } = commitRandomEdit(editor, random);
        const fresh = searchAgain(reference, editor);
        const freshFind = fresh.plugin(BaseFindPlugin);

        ran.add(kind);
        compared += 1;
        if (find.store.get('count') !== before) countChanges += 1;
        if (find.store.get('activeIndex') < freshFind.store.get('count')) {
          freshFind.store.set({ activeIndex: find.store.get('activeIndex') });
        }

        const actual = {
          count: find.store.get('count'),
          matches: ranges(editor),
          paint: painted(editor),
        };
        const wanted = {
          count: freshFind.store.get('count'),
          matches: ranges(fresh),
          paint: painted(fresh),
        };

        if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
          failures.push(
            `seed ${seed} step ${step} after ${kind}: ${JSON.stringify(
              actual
            )} != ${JSON.stringify(wanted)}`
          );
          break;
        }
      }
    }

    expect({ commitsDifferingFromAFreshSearch: failures }).toEqual({
      commitsDifferingFromAFreshSearch: [],
    });
    expect(compared).toBeGreaterThanOrEqual(MIN_COMMITS_COMPARED);
    expect(countChanges).toBeGreaterThanOrEqual(MIN_COUNT_CHANGES);
    expect(commitKinds.filter((kind) => !ran.has(kind))).toEqual([]);
  });

  it('keeps the active result where a text-offset model tracks it through text inserts and deletes, splits, merges and block inserts and removals', () => {
    const failures: string[] = [];
    const judgedKinds = new Set<string>();
    const modeledKinds = commitKinds.filter(
      (kind) => !['move block', 'undo', 'redo'].includes(kind)
    );
    let judged = 0;
    let fellBack = 0;

    for (const seed of SEEDS) {
      const random = createRandom(seed);
      const editor = createFindEditor();
      const reference = createFindEditor();
      const find = editor.plugin(BaseFindPlugin);
      const reported = () => {
        const active = find.store.get('activeMatch');

        return active ? flatRange(editor.read.children(), active.range) : null;
      };
      let failed = false;

      find.api.search(QUERY);

      let tracked = reported();

      for (let step = 0; step < COMMITS_PER_SEED; step += 1) {
        if (random() < 0.4) {
          find.api.move(1);
          tracked = reported();
        }

        const { change, kind } = commitRandomEdit(editor, random);

        if (!change) {
          tracked = reported();
          continue;
        }

        const children = editor.read.children();
        const fresh = ranges(searchAgain(reference, editor)).map((range) =>
          flatRange(children, range)
        );
        const moved = tracked && mapThrough(tracked, change);
        const exact = moved
          ? fresh.findIndex(
              ({ end, start }) => start === moved.start && end === moved.end
            )
          : -1;
        const after = moved
          ? fresh.findIndex(({ end }) => end > moved.start)
          : -1;
        const wanted =
          fresh.length === 0
            ? -1
            : exact !== -1
              ? exact
              : after !== -1
                ? after
                : 0;

        judged += 1;
        judgedKinds.add(kind);
        if (moved && exact === -1 && wanted !== -1) fellBack += 1;
        if (!failed && find.store.get('activeIndex') !== wanted) {
          failed = true;
          failures.push(
            `seed ${seed} step ${step} after ${kind} ${JSON.stringify(
              change
            )}: activeIndex ${find.store.get(
              'activeIndex'
            )} != ${wanted} for tracked ${JSON.stringify(
              moved
            )} in ${JSON.stringify(fresh)}`
          );
        }
        tracked = fresh[wanted] ?? null;
      }
    }

    expect({
      commitsWhereTheActiveResultLeftTheTrackedMatch: failures,
    }).toEqual({ commitsWhereTheActiveResultLeftTheTrackedMatch: [] });
    expect(judged).toBeGreaterThanOrEqual(JUDGED_FLOOR);
    expect(fellBack).toBeGreaterThanOrEqual(FALLBACK_FLOOR);
    expect(modeledKinds.filter((kind) => !judgedKinds.has(kind))).toEqual([]);
  });
});

const structuralWords = ['hello', 'hel', 'lo', 'he', 'llo', 'x', 'o h', ''];

const structuralKinds = [
  'insert text',
  'delete text',
  'split',
  'merge',
  'insert node',
  'remove node',
  'move node',
  'set property',
  'inline to block',
  'block to inline',
  'bold range',
  'wrap',
  'unwrap',
  'two places',
  'undo',
  'redo',
  'search in a failed update',
] as const;

const createGenerator = (random: () => number) => {
  const pick = <T>(items: readonly T[]) =>
    items[Math.floor(random() * items.length)];
  const text = (): Descendant => ({ text: pick(structuralWords) });
  const inline = (): Descendant =>
    random() < 0.6
      ? { type: 'link', url: 'https://platejs.org', children: [text()] }
      : { type: 'findEmptyInline', children: [] };
  const inlines = () =>
    Array.from({ length: 1 + Math.floor(random() * 3) }, () =>
      random() < 0.6 ? text() : inline()
    );
  const block = (depth = 0): Descendant => {
    const roll = random();
    if (roll < 0.5 || depth > 1) {
      return { type: 'paragraph', children: inlines() };
    }
    if (roll < 0.6) return { type: 'findEmptyBlock', children: [] };
    return {
      type: 'findMixed',
      children: Array.from({ length: 1 + Math.floor(random() * 4) }, () => {
        const kind = random();
        if (kind < 0.3) return text();
        if (kind < 0.45) return inline();
        return block(depth + 1);
      }),
    };
  };
  const document = () =>
    random() < 0.1
      ? inlines()
      : Array.from({ length: 2 + Math.floor(random() * 4) }, () => block());

  return { block, document, inline, pick, text };
};

type StructuralEntry = Readonly<{
  node: Descendant;
  parent: string;
  path: Path;
  siblings: number;
}>;

const structuralEntries = (
  children: readonly Descendant[],
  parentPath: Path = [],
  parent = 'root'
): StructuralEntry[] =>
  children.flatMap((node, index) => {
    const path = [...parentPath, index];
    const entry = { node, parent, path, siblings: children.length };

    return TextApi.isText(node)
      ? [entry]
      : [entry, ...structuralEntries(node.children, path, node.type)];
  });

const typeOf = (node: Descendant) =>
  TextApi.isText(node) ? 'text' : node.type;

const commitStructuralEdit = (
  editor: FindEditor,
  random: () => number,
  kind: (typeof structuralKinds)[number]
) => {
  const { block, inline, pick, text } = createGenerator(random);
  const children = editor.read.children();
  const texts = textEntries(children);
  const entries = structuralEntries(children);
  const where = (
    types: readonly string[],
    parents: readonly string[] = ['root', 'findMixed', 'paragraph', 'link']
  ) =>
    entries.filter(
      ({ node, parent }) =>
        types.includes(typeOf(node)) && parents.includes(parent)
    );
  const point = (entry = pick(texts)) => ({
    offset: Math.floor(random() * (entry.length + 1)),
    path: entry.path,
  });
  const setAt = (properties: object, at?: StructuralEntry) => {
    if (at) editor.update.nodes.set(properties as never, { at: at.path });
  };

  if (kind === 'insert text') {
    editor.update.text.insert(pick(structuralWords) || 'hello', {
      at: point(),
    });
  } else if (kind === 'delete text') {
    const entry = pick(texts);
    const [start, end] = [point(entry).offset, point(entry).offset].sort(
      (a, b) => a - b
    );
    editor.update.text.delete({
      at: {
        anchor: { offset: start, path: entry.path },
        focus: { offset: end, path: entry.path },
      },
    });
  } else if (kind === 'split') {
    editor.update.nodes.split({ always: true, at: point() });
  } else if (kind === 'merge') {
    const merging = entries.filter(
      ({ node, path }) =>
        path.at(-1)! > 0 &&
        typeOf(node) !== 'findEmptyBlock' &&
        typeOf(
          entries.find((entry) =>
            PathApi.equals(entry.path, PathApi.previous(path))
          )!.node
        ) === typeOf(node)
    );
    const target = pick(merging);
    if (target) editor.update.nodes.merge({ at: target.path });
  } else if (kind === 'insert node') {
    const parent = pick([
      { path: [] as Path, type: 'root', siblings: children.length },
      ...where(['findMixed', 'paragraph']).map(({ node, path }) => ({
        path,
        siblings: (node as { children: readonly Descendant[] }).children.length,
        type: typeOf(node),
      })),
    ]);
    const node =
      parent.type === 'root'
        ? block(1)
        : parent.type === 'paragraph'
          ? random() < 0.5
            ? text()
            : inline()
          : pick([block(1), inline(), text()]);
    editor.update.nodes.insert(node as never, {
      at: [...parent.path, Math.floor(random() * (parent.siblings + 1))],
    });
  } else if (kind === 'remove node') {
    const target = pick(
      entries.filter(
        ({ parent, siblings }) => parent !== 'link' && siblings > 1
      )
    );
    if (target) editor.update.nodes.remove({ at: target.path });
  } else if (kind === 'move node') {
    const target = pick(entries.filter(({ siblings }) => siblings > 1));
    if (target) {
      editor.update.nodes.move({
        at: target.path,
        to: [
          ...target.path.slice(0, -1),
          Math.floor(random() * target.siblings),
        ],
      });
    }
  } else if (kind === 'set property') {
    setAt(
      { url: pick(['https://platejs.org', 'https://example.com']) },
      pick(where(['link']))
    );
  } else if (kind === 'inline to block') {
    const target = pick(where(['link', 'findEmptyInline'], ['findMixed']));
    setAt(
      {
        type:
          target && typeOf(target.node) === 'link'
            ? 'paragraph'
            : 'findEmptyBlock',
      },
      target
    );
  } else if (kind === 'block to inline') {
    const target = pick(
      where(['paragraph', 'findEmptyBlock'], ['findMixed']).filter(
        ({ node }) =>
          typeOf(node) === 'findEmptyBlock' ||
          (node as { children: readonly Descendant[] }).children.every(
            (child) => TextApi.isText(child)
          )
      )
    );
    setAt(
      target && typeOf(target.node) === 'paragraph'
        ? { type: 'link', url: 'https://platejs.org' }
        : { type: 'findEmptyInline' },
      target
    );
  } else if (kind === 'bold range') {
    const first = Math.floor(random() * texts.length);
    const last = Math.min(texts.length - 1, first + Math.floor(random() * 3));
    editor.update((tx) => {
      tx.selection.set({
        anchor: point(texts[first]),
        focus: point(texts[last]),
      });
      tx.marks.toggle('bold');
    });
  } else if (kind === 'wrap') {
    const target = pick(
      where(['paragraph', 'findEmptyBlock', 'findMixed'], ['root', 'findMixed'])
    );
    if (target) {
      editor.update((tx) =>
        tx.nodes.wrap(
          { type: 'findMixed', children: [] },
          {
            at: target.path,
          }
        )
      );
    }
  } else if (kind === 'unwrap') {
    const target = pick(where(['findMixed'], ['findMixed']));
    if (target) editor.update.nodes.unwrap({ at: target.path });
  } else if (kind === 'two places') {
    const first = pick(texts);
    const second = pick(texts);
    editor.update((tx) => {
      tx.text.insert('hello', { at: point(first) });
      tx.text.insert('lo', { at: point(second) });
    });
  } else if (kind === 'undo') {
    editor.api.history.undo();
  } else if (kind === 'redo') {
    editor.api.history.redo();
  } else {
    const find = editor.plugin(BaseFindPlugin);
    try {
      editor.update((tx) => {
        tx.text.insert('hello', { at: point() });
        find.api.search('');
        find.api.search(QUERY);
        throw new Error('roll back');
      });
    } catch {
      return true;
    }
  }

  return false;
};

const STRUCTURAL_COMMITS = 40;
const MIN_LOCAL_SEARCHES = 40;
const MIN_FALLBACKS = 1;
const MIN_UNDO_LOCAL_SEARCHES = 10;

describe('find results through structural edits', () => {
  it('match a fresh search after every commit, through app writes and writes made during a publish', () => {
    const failures: string[] = [];
    const ran = new Set<string>();
    let compared = 0;
    let localSearches = 0;
    let fallbacks = 0;
    let undoLocalSearches = 0;

    for (const seed of SEEDS) {
      const random = createRandom(seed);
      const editor = createFindEditor(createGenerator(random).document());
      const find = editor.plugin(BaseFindPlugin);
      let armed: 'matches' | 'search' | null = null;
      let wrote: 'matches' | 'search' | null = null;
      const stop = find.store.subscribe(() => {
        const write = armed;
        armed = null;
        if (!write) return;
        wrote = write;
        if (write === 'matches') {
          find.store.set({ matches: find.store.get('matches').slice(1) });
        } else {
          find.api.search('');
          find.api.search(QUERY);
        }
      });

      find.api.search(QUERY);

      for (let step = 0; step < STRUCTURAL_COMMITS; step += 1) {
        const appWrite = random();
        const { matches } = find.store.get();
        if (appWrite < 0.1) {
          find.store.set({ matches: matches.slice(1) });
        } else if (appWrite < 0.2 && matches.length > 0) {
          find.store.set({
            activeIndex: Math.floor(random() * matches.length),
          });
        }
        if (random() < 0.08) armed = random() < 0.5 ? 'matches' : 'search';
        wrote = null;

        const kind =
          structuralKinds[Math.floor(random() * structuralKinds.length)];
        const before = editor.read.children();
        const searches = spyOn(NodeApi, 'findTextRanges');
        let scopedSearches: boolean[] = [];
        let rolledBack = false;
        try {
          rolledBack = commitStructuralEdit(editor, random, kind);
        } catch {
          // The schema refuses some generated edits; they commit nothing.
        } finally {
          scopedSearches = searches.mock.calls.map((call) =>
            Boolean(call[2]?.at)
          );
          searches.mockRestore();
        }
        armed = null;

        if (editor.read.children() === before && !rolledBack) continue;

        ran.add(kind);
        if (rolledBack) {
          // A search in an update that threw settles at the next commit, even
          // one that changes only the selection.
          const [first] = textEntries(editor.read.children());
          editor.update.selection.set(
            editor.read.selection() ? null : { offset: 0, path: first.path }
          );
        } else {
          const scoped = scopedSearches.filter(Boolean).length;
          localSearches += scoped;
          if (kind === 'undo') undoLocalSearches += scoped;
          if (
            wrote === null &&
            scopedSearches.length > scoped &&
            kind !== 'undo' &&
            kind !== 'redo'
          ) {
            fallbacks += 1;
          }
        }
        // A write a subscriber makes during Find's publish shows until the
        // next commit.
        if (wrote === 'matches') continue;

        // A reference editor would load these trees normalized, so the fresh
        // search reads this editor's own tree.
        const fresh = NodeApi.findTextRanges(editor, QUERY, {
          caseSensitive: false,
        });
        const activeIndex = find.store.get('activeIndex');

        compared += 1;

        const actual = {
          activeIndex,
          count: find.store.get('count'),
          matches: ranges(editor),
          paint: painted(editor).flatMap(({ decorations }) => decorations),
        };
        const wanted = {
          activeIndex: fresh.length === 0 ? -1 : activeIndex,
          count: fresh.length,
          matches: fresh,
          paint: fresh.map((range, index) => ({
            active: index === activeIndex,
            match: true,
            range,
          })),
        };

        if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
          failures.push(
            `seed ${seed} step ${step} after ${kind}: ${JSON.stringify(
              actual
            )} != ${JSON.stringify(wanted)} in ${JSON.stringify(
              editor.read.children()
            )}`
          );
          break;
        }
      }
      stop();
    }

    console.info(
      `log: compared=${compared} local=${localSearches} undoLocal=${undoLocalSearches} fallbacks=${fallbacks}`
    );
    expect({ commitsDifferingFromAFreshSearch: failures }).toEqual({
      commitsDifferingFromAFreshSearch: [],
    });
    expect(structuralKinds.filter((kind) => !ran.has(kind))).toEqual([]);
    expect(compared).toBeGreaterThanOrEqual(MIN_COMMITS_COMPARED);
    expect(localSearches).toBeGreaterThanOrEqual(MIN_LOCAL_SEARCHES);
    expect(undoLocalSearches).toBeGreaterThanOrEqual(MIN_UNDO_LOCAL_SEARCHES);
    expect(fallbacks).toBeGreaterThanOrEqual(MIN_FALLBACKS);
  });
});

const NoteHolder = definePlugin('findNoteHolder', {
  dependencies: [BaseParagraphPlugin],
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

const BLOCKS = 300;

const createLargeFindEditor = () =>
  createEditor({
    initialValue: {
      children: [
        ...Array.from({ length: BLOCKS }, (_, index) => ({
          type: 'paragraph',
          children: [{ text: `hello ${index}` }],
        })),
        {
          type: 'findNoteHolder',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ],
      roots: { note: [{ type: 'paragraph', children: [{ text: 'note' }] }] },
    },
    plugins: [BaseParagraphPlugin, NoteHolder, BaseFindPlugin],
  });

const measureWork = (
  editor: ReturnType<typeof createLargeFindEditor>,
  commit: () => void
) => {
  const find = editor.plugin(BaseFindPlugin);
  const [source] = getPlateDecorationSources(editor);
  const refreshed = new Set<NodeKey | 'all'>();
  let writes = 0;
  const stopObserving = source.observe!({
    editor,
    refresh: ({ nodeKeys }) => {
      if (nodeKeys === 'all') refreshed.add('all');
      else for (const key of nodeKeys) refreshed.add(key);
    },
  });
  const stopCounting = find.store.subscribe(() => {
    writes += 1;
  });
  const searches = spyOn(NodeApi, 'findTextRanges');

  try {
    commit();

    return { refreshed, searches: searches.mock.calls.length, writes };
  } finally {
    searches.mockRestore();
    stopCounting();
    stopObserving();
  }
};

describe('find work per commit', () => {
  it('runs no search and writes nothing on a selection-only commit', () => {
    const editor = createLargeFindEditor();

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    const work = measureWork(editor, () =>
      editor.update.selection.set({ offset: 2, path: [150, 0] })
    );

    expect({ searches: work.searches, writes: work.writes }).toEqual({
      searches: 0,
      writes: 0,
    });
  });

  it('runs no search and writes nothing on a selection-only commit after the app picks the active result', () => {
    const editor = createLargeFindEditor();
    const find = editor.plugin(BaseFindPlugin);

    find.api.search(QUERY);
    find.store.set({ activeIndex: 120 });

    const work = measureWork(editor, () =>
      editor.update.selection.set({ offset: 2, path: [150, 0] })
    );

    expect({ searches: work.searches, writes: work.writes }).toEqual({
      searches: 0,
      writes: 0,
    });
  });

  it('runs no search and writes nothing on a commit to a named root', () => {
    const editor = createLargeFindEditor();
    const note = createEditorView(editor, { root: 'note' });

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    const work = measureWork(editor, () =>
      note.update.text.insert(' hello', { at: { offset: 4, path: [0, 0] } })
    );

    expect({ searches: work.searches, writes: work.writes }).toEqual({
      searches: 0,
      writes: 0,
    });
  });

  it('writes and refreshes nothing on a keystroke that changes no match', () => {
    const editor = createLargeFindEditor();

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    const work = measureWork(editor, () =>
      editor.update.text.insert('x', { at: { offset: 9, path: [150, 0] } })
    );

    expect({ refreshed: work.refreshed.size, writes: work.writes }).toEqual({
      refreshed: 0,
      writes: 0,
    });
  });

  it('refreshes only the edited block and the old and new active matches on a keystroke that adds a match', () => {
    const editor = createLargeFindEditor();
    const find = editor.plugin(BaseFindPlugin);
    const activeKey = () =>
      editor.key(find.store.get('activeMatch').range.anchor.path);

    find.api.search(QUERY);

    const activeBefore = activeKey();
    const work = measureWork(editor, () =>
      editor.update.text.insert(' hello', {
        at: { offset: 9, path: [150, 0] },
      })
    );
    const allowed = new Set([editor.key([150, 0]), activeBefore, activeKey()]);

    expect({
      count: find.store.get('count'),
      refreshedOutsideEditedBlockAndActive: [...work.refreshed].filter(
        (key) => !allowed.has(key as NodeKey)
      ).length,
    }).toEqual({ count: BLOCKS + 1, refreshedOutsideEditedBlockAndActive: 0 });
  });

  it('republishes once and refreshes no text node when a block is inserted above the matches', () => {
    const editor = createLargeFindEditor();

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    const work = measureWork(editor, () =>
      editor.update.nodes.insert(
        { type: 'paragraph', children: [{ text: 'plain' }] },
        { at: [0] }
      )
    );

    expect({ refreshed: work.refreshed.size, writes: work.writes }).toEqual({
      refreshed: 0,
      writes: 1,
    });
  });

  const searchedScopes = (commit: () => void) => {
    const searches = spyOn(NodeApi, 'findTextRanges');

    try {
      commit();

      return searches.mock.calls.map((call) => call[2]?.at);
    } finally {
      searches.mockRestore();
    }
  };

  const createBlocksEditor = (blocks: number, text = 'hello') =>
    createEditor({
      initialValue: Array.from({ length: blocks }, () => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      plugins: [BaseFindPlugin, BaseBoldPlugin],
    });

  it.each([100, 1000])(
    'searches only the edited paragraph when typing in %i blocks',
    (blocks) => {
      const editor = createBlocksEditor(blocks);
      const middle = blocks / 2;

      editor.plugin(BaseFindPlugin).api.search(QUERY);

      expect(
        searchedScopes(() =>
          editor.update.text.insert('x', {
            at: { offset: 0, path: [middle, 0] },
          })
        )
      ).toEqual([[middle]]);
    }
  );

  it.each(['undo', 'redo'] as const)(
    'searches only the edited paragraph for a %s commit',
    (kind) => {
      const editor = createBlocksEditor(1000);
      const at = { offset: 0, path: [500, 0] };

      editor.plugin(BaseFindPlugin).api.search(QUERY);
      editor.update.text.insert('x', { at });
      if (kind === 'redo') editor.api.history.undo();

      expect(searchedScopes(() => editor.api.history[kind]())).toEqual([[500]]);
    }
  );

  const createContainerEditor = () =>
    createEditor({
      initialValue: [
        ...Array.from({ length: 10 }, () => ({
          type: 'paragraph',
          children: [{ text: 'hello' }],
        })),
        {
          type: 'findMixed',
          children: [
            { text: 'hello beside' },
            { type: 'paragraph', children: [{ text: 'hello inside' }] },
            {
              type: 'findMixed',
              children: [
                { type: 'paragraph', children: [{ text: 'hello nested' }] },
              ],
            },
          ],
        },
      ],
      plugins: [
        BaseFindPlugin,
        BaseLinkPlugin,
        FindEmptyBlock,
        FindEmptyInline,
        FindMixed,
      ],
    });

  it.each([
    ['text beside a block', [10, 0], [10, 0]],
    ['a paragraph beside text', [10, 1, 0], [10, 1]],
    ['a paragraph in a nested container', [10, 2, 0, 0], [10, 2, 0]],
  ] as const)('searches only %s when typing there', (_, path, scope) => {
    const editor = createContainerEditor();

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    expect(
      searchedScopes(() =>
        editor.update.text.insert('x', { at: { offset: 0, path: [...path] } })
      )
    ).toEqual([[...scope]]);
  });

  it('reads no unchanged inline element beside the paragraph typed in', () => {
    const InlineGroup = definePlugin('findInlineGroup', {
      schema: {
        element: {
          inline: true,
          content: schema.content.any([
            schema.content.text(),
            schema.content.type('link'),
          ]),
        },
      },
    });
    const GroupContainer = definePlugin('findGroupContainer', {
      schema: {
        element: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.type('findInlineGroup'),
            schema.content.type('paragraph'),
          ]),
        },
      },
    });
    const inlineReads = (links: number) => {
      const editor = createEditor({
        initialValue: [
          {
            type: 'findGroupContainer',
            children: [
              {
                type: 'findInlineGroup',
                children: Array.from({ length: links }, () => ({
                  type: 'link',
                  url: 'https://platejs.org',
                  children: [{ text: 'x' }],
                })),
              },
              { type: 'paragraph', children: [{ text: 'hello' }] },
            ],
          },
        ],
        plugins: [BaseFindPlugin, BaseLinkPlugin, GroupContainer, InlineGroup],
      });
      const paragraph = (
        editor.read.children()[0] as { children: readonly Descendant[] }
      ).children.findIndex(
        (node) => 'type' in node && node.type === 'paragraph'
      );

      editor.plugin(BaseFindPlugin).api.search(QUERY);
      const { isInline } = editor.read.schema;
      let reads = 0;
      Object.defineProperty(editor.read.schema, 'isInline', {
        configurable: true,
        value: (node: Descendant) => {
          reads += 1;

          return isInline(node);
        },
      });
      try {
        editor.update.text.insert('x', {
          at: { offset: 0, path: [0, paragraph, 0] },
        });

        return reads;
      } finally {
        Object.defineProperty(editor.read.schema, 'isInline', {
          configurable: true,
          value: isInline,
        });
      }
    };
    const few = inlineReads(10);

    expect(few).toBeGreaterThan(0);
    expect(inlineReads(1000)).toBe(few);
  });

  it('searches only the bolded paragraph once when bolding splits its text', () => {
    const editor = createBlocksEditor(1000, 'hello one hello two hello');

    editor.plugin(BaseFindPlugin).api.search(QUERY);

    expect(
      searchedScopes(() =>
        editor.update((tx) => {
          tx.selection.set({
            anchor: { offset: 3, path: [500, 0] },
            focus: { offset: 15, path: [500, 0] },
          });
          tx.marks.toggle('bold');
        })
      )
    ).toEqual([[500]]);
  });

  it('paints a list the app writes out of document order with one sort and one binary search per text node', () => {
    const comparisons = (blocks: number) => {
      const editor = createFindEditor(
        Array.from({ length: blocks }, () => ({
          type: 'paragraph',
          children: [{ text: 'hello' }],
        }))
      );
      const find = editor.plugin(BaseFindPlugin);

      find.api.search(QUERY);
      find.store.set({ matches: [...find.store.get('matches')].reverse() });
      const equals = spyOn(PathApi, 'equals');
      const compare = spyOn(PathApi, 'compare');
      try {
        expect(
          painted(editor).flatMap(({ decorations }) => decorations)
        ).toHaveLength(blocks);

        return equals.mock.calls.length + compare.mock.calls.length;
      } finally {
        compare.mockRestore();
        equals.mockRestore();
      }
    };

    expect(comparisons(1000)).toBeLessThan(comparisons(100) * 20);
  });
});
