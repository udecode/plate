import {
  createEditor,
  type Descendant,
  NodeApi,
  type Path,
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

const createFindEditor = () =>
  createEditor({
    initialValue: editedValue,
    plugins: [BaseFindPlugin, BaseLinkPlugin, BaseBoldPlugin],
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

  if (kind === 'insert text') {
    const text = pick(fragments);
    const at = point();

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

    editor.update.text.delete({ at });
  } else if (kind === 'delete across') {
    const index = Math.floor(random() * texts.length);
    const last = Math.min(
      texts.length - 1,
      index + 1 + Math.floor(random() * 2)
    );
    const at = { anchor: point(texts[index]), focus: point(texts[last]) };

    editor.update.text.delete({ at });
  } else if (kind === 'split') {
    editor.update.nodes.split({ always: true, at: point() });
  } else if (kind === 'merge' && blocks > 1) {
    const at = 1 + Math.floor(random() * (blocks - 1));

    editor.update.nodes.merge({ at: [at] });
  } else if (kind === 'insert block') {
    const block = structuredClone(pick(insertedBlocks));
    const at = Math.floor(random() * (blocks + 1));

    editor.update.nodes.insert(block, { at: [at] });
  } else if (kind === 'remove block' && blocks > 1) {
    editor.update.nodes.remove({ at: [Math.floor(random() * blocks)] });
  } else if (kind === 'move block' && blocks > 1) {
    const at = Math.floor(random() * blocks);
    const to = Math.floor(random() * blocks);

    if (at !== to) editor.update.nodes.move({ at: [at], to: [to] });
  } else if (kind === 'undo') {
    editor.api.history.undo();
  } else if (kind === 'redo') {
    editor.api.history.redo();
  }

  return kind;
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
        const kind = commitRandomEdit(editor, random);
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
            `seed ${seed} step ${step} after ${kind}: ${JSON.stringify(actual)} != ${JSON.stringify(wanted)}`
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
});

const BLOCKS = 300;

const createLargeFindEditor = () =>
  createEditor({
    initialValue: Array.from({ length: BLOCKS }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `hello ${index}` }],
    })),
    plugins: [BaseFindPlugin],
  });

const measureWork = (
  editor: ReturnType<typeof createLargeFindEditor>,
  commit: () => void
) => {
  const find = editor.plugin(BaseFindPlugin);
  let writes = 0;
  const stopCounting = find.store.subscribe(() => {
    writes += 1;
  });
  const searches = spyOn(NodeApi, 'findTextRanges');

  try {
    commit();

    return { searches: searches.mock.calls.length, writes };
  } finally {
    searches.mockRestore();
    stopCounting();
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
});
