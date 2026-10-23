import {
  BaseParagraphPlugin,
  type Descendant,
  NodeApi,
  type Path,
  type Range,
  TextApi,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  schema,
} from '../../../core';
import { defineRuntimePluginSlot } from '../../../facade';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import { BaseLinkPlugin } from '../../link';
import { BaseFindPlugin } from './BaseFindPlugin';

const createFindEditor = () =>
  createEditor({
    plugins: [BaseFindPlugin, BaseLinkPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'hello ' },
          {
            type: 'link',
            url: 'https://platejs.org',
            children: [{ text: 'world' }],
          },
          { text: ' again' },
        ],
      },
      { type: 'paragraph', children: [{ text: 'hello outside' }] },
    ],
  });

test('finds literal case-insensitive text across inline nodes without document writes', () => {
  const editor = createFindEditor();
  const { api, store, update } = editor.plugin(BaseFindPlugin);
  const before = editor.read.children();
  api.search('HELLO world again');
  expect(store.get('count')).toBe(1);
  expect(store.get('activeMatch')?.range).toEqual({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 2], offset: 6 },
  });
  expect(editor.read.children()).toBe(before);
  expect(update.select()).toBe(true);
  expect(editor.read.selection()).toEqual(store.get('activeMatch')?.range);
  expect(editor.read.children()).toBe(before);
});

test('wraps matches without rescanning on navigation or selection', () => {
  const editor = createFindEditor();
  const { api, store, update } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  const matches = store.get('matches');
  const find = spyOn(NodeApi, 'findTextRanges');
  try {
    api.move(-1);
    expect(store.get('activeIndex')).toBe(1);
    api.move(1);
    expect(store.get('activeIndex')).toBe(0);
    update.select();
    api.search('hello');
    expect(find).not.toHaveBeenCalled();
    expect(store.get('matches')).toBe(matches);
    api.search('');
    expect(store.get('activeMatch')).toBeNull();
    expect(update.select()).toBe(false);
  } finally {
    find.mockRestore();
  }
});

test('refreshes edited text, undo and replacement without a mounted view', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
  expect(store.get('count')).toBe(3);
  expect(store.get('activeIndex')).toBe(2);
  editor.api.history.undo();
  expect(store.get('count')).toBe(2);
  expect(store.get('activeIndex')).toBe(1);
  editor.update.value.replace({
    children: [{ type: 'paragraph', children: [{ text: 'unmatched' }] }],
  });
  expect(store.get('count')).toBe(0);
  expect(store.get('activeIndex')).toBe(-1);
});

const activeText = (editor: ReturnType<typeof createEditor>) => {
  const match = editor.plugin(BaseFindPlugin).store.get('activeMatch');

  return match
    ? NodeApi.string(editor.read.children()[match.range.anchor.path[0]])
    : null;
};

const createParagraphEditor = (...texts: string[]) =>
  createEditor({
    plugins: [BaseFindPlugin],
    initialValue: texts.map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
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

const createNoteEditor = (...texts: string[]) => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, NoteHolder, BaseFindPlugin],
    initialValue: {
      children: [
        ...texts.map((text) => ({
          type: 'paragraph',
          children: [{ text }],
        })),
        {
          type: 'findNoteHolder',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ],
      roots: {
        note: [{ type: 'paragraph', children: [{ text: 'note text here' }] }],
      },
    },
  });

  return { editor, note: createEditorView(editor, { root: 'note' }) };
};

test('keeps the active result on its match when a block with a match is inserted above it, and through undo', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  editor.update.nodes.insert(
    { type: 'paragraph', children: [{ text: 'hello above' }] },
    { at: [0] }
  );
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 2,
    text: 'hello outside',
  });
  editor.api.history.undo();
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 1,
    text: 'hello outside',
  });
});

const deleteActiveBlockWithAnEarlierMatch = () => {
  const editor = createParagraphEditor(
    'hello a',
    'hello b',
    'hello c',
    'hello d'
  );
  const { api } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  api.move(1);
  editor.update((tx) => {
    tx.nodes.remove({ at: [2] });
    tx.nodes.remove({ at: [0] });
  });
  return editor;
};

test('moves the active result to the next surviving match when one commit removes its block and an earlier match', () => {
  const editor = deleteActiveBlockWithAnEarlierMatch();
  expect({
    activeIndex: editor.plugin(BaseFindPlugin).store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 1,
    text: 'hello d',
  });
});

test('keeps the next match active through undo of the commit that removed the active block', () => {
  const editor = deleteActiveBlockWithAnEarlierMatch();
  editor.api.history.undo();
  expect({
    activeIndex: editor.plugin(BaseFindPlugin).store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 3,
    text: 'hello d',
  });
});

test('lands on the match that overlaps the active one each time a self-overlapping query shifts', () => {
  const editor = createParagraphEditor('aaaa');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('aa');
  api.move(1);
  editor.update.text.insert('a', { at: { path: [0, 0], offset: 0 } });
  editor.update.text.insert('a', { at: { path: [0, 0], offset: 0 } });
  expect({
    activeIndex: store.get('activeIndex'),
    range: store.get('activeMatch')?.range,
  }).toEqual({
    activeIndex: 1,
    range: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 4 },
    },
  });
});

test('keeps the active result on its match through undo that restores an earlier match', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  editor.update.text.delete({
    at: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    },
  });
  api.search('hello');
  api.move(1);
  editor.api.history.undo();
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 2,
    text: 'hello c',
  });
});

test('keeps the active result on its match when a remote commit adds an earlier match', () => {
  const editor = createParagraphEditor('hello a', 'hello b');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
    tx.text.insert('hello ', { at: { path: [0, 0], offset: 0 } });
  });
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 2,
    text: 'hello b',
  });
});

test('keeps an active result the app chose through an edit that adds a match in an earlier block', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ activeIndex: 2 });
  editor.update.text.insert('hello ', { at: { path: [0, 0], offset: 0 } });
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 3,
    text: 'hello c',
  });
});

test('keeps an active result the app chose through an edit that adds a match before it in its own block', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ activeIndex: 1 });
  editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
  expect({
    activeIndex: store.get('activeIndex'),
    range: store.get('activeMatch')?.range,
  }).toEqual({
    activeIndex: 2,
    range: {
      anchor: { path: [1, 0], offset: 6 },
      focus: { path: [1, 0], offset: 11 },
    },
  });
});

test('keeps an active result the app chose when a block with a match is inserted above it', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ activeIndex: 1 });
  editor.update.nodes.insert(
    { type: 'paragraph', children: [{ text: 'hello above' }] },
    { at: [0] }
  );
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 2,
    text: 'hello b',
  });
});

test('keeps the active result on its match when its own block moves', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  editor.update.nodes.move({ at: [1], to: [2] });
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 2,
    text: 'hello b',
  });
});

test('keeps an active result the app chose inside a named-root transaction through a main-document edit that adds an earlier match', () => {
  const { editor, note } = createNoteEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  note.update(() => {
    note.plugin(BaseFindPlugin).store.set({ activeIndex: 2 });
  });
  editor.update.text.insert('hello ', { at: { path: [0, 0], offset: 0 } });
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 3,
    text: 'hello c',
  });
});

test('notifies a later store subscriber once per search and per commit that changes a match', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'plain');
  const { api, store } = editor.plugin(BaseFindPlugin);
  const heard: string[] = [];
  const stop = store.subscribe((state, previous) => {
    if (state.matches !== previous.matches) {
      heard.push(`${state.query}: ${state.matches.length}`);
    }
  });
  try {
    api.search('hello');
    editor.update.text.insert('hello ', { at: { path: [2, 0], offset: 0 } });
    editor.update.text.insert('!', { at: { path: [0, 0], offset: 7 } });
    editor.update.selection.set({ path: [1, 0], offset: 2 });
    api.search('plain');
    expect(heard).toEqual(['hello: 2', 'hello: 3', 'plain: 1']);
  } finally {
    stop();
  }
});

test('advances once per change of matches for a later subscriber that moves on each change', () => {
  const editor = createParagraphEditor(
    'hello a',
    'hello b',
    'hello c',
    'plain'
  );
  const { api, store } = editor.plugin(BaseFindPlugin);
  const stop = store.subscribe((state, previous) => {
    if (state.matches !== previous.matches) api.move(1);
  });
  try {
    api.search('hello');
    const afterSearch = activeText(editor);
    editor.update.text.insert('hello ', { at: { path: [3, 0], offset: 0 } });
    expect({ afterCommit: activeText(editor), afterSearch }).toEqual({
      afterCommit: 'hello c',
      afterSearch: 'hello b',
    });
  } finally {
    stop();
  }
});

test('keeps an active result a subscriber picks while a commit publishes through the next edit', () => {
  const editor = createParagraphEditor(
    'hello a',
    'hello b',
    'hello c',
    'plain'
  );
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  let pickLast = true;
  const stop = store.subscribe((state, previous) => {
    if (!pickLast || state.matches === previous.matches) return;
    pickLast = false;
    store.set({ activeIndex: state.matches.length - 1 });
  });
  try {
    editor.update.text.insert('hello ', { at: { path: [3, 0], offset: 0 } });
    editor.update.text.insert('hello ', { at: { path: [0, 0], offset: 0 } });
    expect({
      activeIndex: store.get('activeIndex'),
      text: activeText(editor),
    }).toEqual({
      activeIndex: 4,
      text: 'hello plain',
    });
  } finally {
    stop();
  }
});

const typedBeforeActive = {
  activeIndex: 2,
  range: {
    anchor: { path: [1, 0], offset: 6 },
    focus: { path: [1, 0], offset: 11 },
  },
};
const wrappedAfterRemoval = {
  activeIndex: 0,
  range: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 5 },
  },
};

test.each([
  [
    'store.set({ activeIndex: 2 })',
    'types before the active match in its block',
    typedBeforeActive,
  ],
  [
    'api.move(1)',
    'types before the active match in its block',
    typedBeforeActive,
  ],
  [
    'store.set({ activeIndex: 2 })',
    'removes an earlier block',
    wrappedAfterRemoval,
  ],
  ['api.move(1)', 'removes an earlier block', wrappedAfterRemoval],
] as const)(
  'applies %s made after a transaction %s to the list published at commit',
  (write, edit, wanted) => {
    const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
    const { api, store } = editor.plugin(BaseFindPlugin);
    api.search('hello');
    api.move(1);
    editor.update((tx) => {
      if (edit === 'removes an earlier block') tx.nodes.remove({ at: [0] });
      else tx.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
      if (write === 'api.move(1)') api.move(1);
      else store.set({ activeIndex: 2 });
    });
    expect({
      activeIndex: store.get('activeIndex'),
      range: store.get('activeMatch')?.range,
    }).toEqual(wanted);
  }
);

test.each([
  ['an unrelated field', { error: null }],
  ['the active result it already shows', { activeIndex: 1 }],
] as const)(
  'keeps following the active match when the app writes %s after a transaction types before it',
  (_, write) => {
    const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
    const { api, store } = editor.plugin(BaseFindPlugin);
    api.search('hello');
    api.move(1);
    editor.update((tx) => {
      tx.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
      store.set(write);
    });
    expect({
      activeIndex: store.get('activeIndex'),
      range: store.get('activeMatch')?.range,
    }).toEqual(typedBeforeActive);
  }
);

test('searches a new query inside a transaction that removed a block', () => {
  const editor = createParagraphEditor('plain', 'hello');
  const { api } = editor.plugin(BaseFindPlugin);
  editor.update((tx) => {
    tx.nodes.remove({ at: [0] });
    api.search('hello');
  });
  expect(results(editor)).toEqual(freshResults(editor, 'hello'));
});

test('keeps following a match searched inside a transaction through a later edit in that transaction', () => {
  const editor = createParagraphEditor('plain', 'hello');
  const { api } = editor.plugin(BaseFindPlugin);
  editor.update((tx) => {
    tx.nodes.remove({ at: [0] });
    api.search('hello');
    tx.nodes.insert(
      { type: 'paragraph', children: [{ text: 'hello new' }] },
      { at: [0] }
    );
  });
  expect(activeText(editor)).toBe('hello');
});

test('applies an active result written in a transaction that throws at the next edit', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  expect(() =>
    editor.update((tx) => {
      tx.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
      store.set({ activeIndex: 2 });
      throw new Error('Rejected');
    })
  ).toThrow('Rejected');
  editor.update.text.insert('!', { at: { path: [0, 0], offset: 7 } });
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({ activeIndex: 2, text: 'hello c' });
});

const textPaths = (
  children: readonly Descendant[],
  parent: Path = []
): Path[] =>
  children.flatMap((node, index) =>
    TextApi.isText(node)
      ? [[...parent, index]]
      : textPaths(node.children, [...parent, index])
  );

const results = (editor: ReturnType<typeof createEditor>) => {
  const [source] = getPlateDecorationSources(editor);
  const { store } = editor.plugin(BaseFindPlugin);
  return {
    active: store.get('activeMatch')?.range ?? null,
    matches: store.get('matches').map((match) => match.range),
    paint: textPaths(editor.read.children()).map((path) =>
      source
        .read({ editor, entry: editor.read.nodes.get(path)! })
        .map(({ attributes, range }) => ({
          active: attributes?.['data-find-active'] !== undefined,
          range,
        }))
    ),
  };
};

const freshResults = (
  editor: ReturnType<typeof createEditor>,
  query: string
) => {
  const fresh = createEditor({
    plugins: [BaseFindPlugin, BaseLinkPlugin],
    initialValue: structuredClone(editor.read.children()),
  });
  const find = fresh.plugin(BaseFindPlugin);
  find.api.search(query);
  find.store.set({
    activeIndex: editor.plugin(BaseFindPlugin).store.get('activeIndex'),
  });
  return results(fresh);
};

test('reruns the search at once for a new query', () => {
  const editor = createFindEditor();
  const { api } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.search('world');
  const world = {
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 5 },
  };
  expect(results(editor)).toEqual({
    active: world,
    matches: [world],
    paint: [[], [{ active: true, range: world }], [], []],
  });
});

test('starts a new query on its first match after the old query moved past its first', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  api.search('hell');
  expect({
    activeIndex: store.get('activeIndex'),
    text: activeText(editor),
  }).toEqual({
    activeIndex: 0,
    text: 'hello world again',
  });
});

test('clears matches and highlights for an empty query', () => {
  const editor = createFindEditor();
  const { api } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.search('');
  expect(results(editor)).toEqual(freshResults(editor, ''));
});

test('gives a later store subscriber the matches of a new query', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  let seen: readonly Range[] = [];
  const stop = store.subscribe((state) => {
    seen = state.matches.map((match) => match.range);
  });
  try {
    api.search('world');
    const matches = [
      {
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 5 },
      },
    ];
    expect({
      lastNotified: seen,
      read: store.get('matches').map((match) => match.range),
    }).toEqual({ lastNotified: matches, read: matches });
  } finally {
    stop();
  }
});

test('keeps searching the last searched query at the next edit after the app writes a query to the store', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ query: 'world' });
  editor.update.text.insert(' hello', { at: { path: [1, 0], offset: 13 } });
  expect(results(editor)).toEqual(freshResults(editor, 'hello'));
});

test('replaces a reordered match list the app writes with its own at the next commit, even one that only moves the selection', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ matches: [...store.get('matches')].reverse() });
  editor.update.selection.set({ path: [1, 0], offset: 0 });
  expect(results(editor)).toEqual(freshResults(editor, 'hello'));
});

test('restores the query when the app searches its last query again after writing another to the store', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  store.set({ query: 'world' });
  api.search('hello');
  expect(store.get('query')).toBe('hello');
});

test('ends equal to a fresh search of the normalized query when subscribers search and move while the store notifies', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  const stops = [
    store.subscribe((state) => api.search(state.query.trimEnd())),
    store.subscribe((state, previous) => {
      if (state.matches !== previous.matches) api.move(1);
    }),
  ];
  try {
    api.search('hello   ');
    const afterSearch = results(editor);
    const wantedAfterSearch = freshResults(editor, 'hello');
    editor.update.text.insert(' hello', { at: { path: [1, 0], offset: 13 } });
    expect({
      afterEdit: results(editor),
      afterSearch,
      query: store.get('query'),
    }).toEqual({
      afterEdit: freshResults(editor, 'hello'),
      afterSearch: wantedAfterSearch,
      query: 'hello',
    });
  } finally {
    for (const stop of stops) stop();
  }
});

test('matches a fresh search through edits around a surrogate pair before a match', () => {
  const editor = createEditor({
    plugins: [BaseFindPlugin, BaseLinkPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '😀 hello' }] }],
  });
  editor.plugin(BaseFindPlugin).api.search('hello');
  const steps = [
    () => editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } }),
    () => editor.update.text.insert('y', { at: { path: [0, 0], offset: 3 } }),
    () => editor.update.text.insert('😀', { at: { path: [0, 0], offset: 4 } }),
  ];
  const diverged = steps.flatMap((step, index) => {
    step();
    const actual = results(editor);
    return JSON.stringify(actual) ===
      JSON.stringify(freshResults(editor, 'hello'))
      ? []
      : [{ actual, step: index }];
  });
  expect({
    diverged,
    text: NodeApi.string(editor.read.children()[0]),
  }).toEqual({ diverged: [], text: 'x😀y😀 hello' });
});

test('matches a fresh search through edits inside and around a match that spans a link', () => {
  const editor = createFindEditor();
  editor.plugin(BaseFindPlugin).api.search('lo wor');
  const steps = [
    () => editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } }),
    () =>
      editor.update.text.insert('z', { at: { path: [0, 1, 0], offset: 4 } }),
    () =>
      editor.update.text.insert('q', { at: { path: [0, 1, 0], offset: 1 } }),
    () => editor.api.history.undo(),
    () => editor.update.text.insert('!', { at: { path: [0, 2], offset: 0 } }),
    () =>
      editor.update.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      }),
  ];
  const diverged = steps.flatMap((step, index) => {
    step();
    const actual = results(editor);
    return JSON.stringify(actual) ===
      JSON.stringify(freshResults(editor, 'lo wor'))
      ? []
      : [{ actual, step: index }];
  });
  expect({ diverged, matched: results(editor).matches.length }).toEqual({
    diverged: [],
    matched: 1,
  });
});

test('matches a fresh search after the whole value is replaced with new text', () => {
  const editor = createFindEditor();
  const { api } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  editor.update.value.replace({
    children: [
      { type: 'paragraph', children: [{ text: 'one hello' }] },
      { type: 'paragraph', children: [{ text: 'hello hello' }] },
    ],
  });
  expect(results(editor)).toEqual(freshResults(editor, 'hello'));
});

test("searches and keys the main document when a named root's view searches inside its update", () => {
  const { editor, note } = createNoteEditor('here a', 'plain');
  const { store } = editor.plugin(BaseFindPlugin);
  note.update(() => {
    note.plugin(BaseFindPlugin).api.search('here');
  });
  const published = store.get('matches');
  let notified = 0;
  const stop = store.subscribe(() => {
    notified += 1;
  });
  editor.update.text.insert('!', { at: { path: [1, 0], offset: 5 } });
  stop();
  expect({ notified, published }).toEqual({
    notified: 0,
    published: [
      {
        id: `${editor.key([0, 0])}:0`,
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        },
      },
    ],
  });
});

test('selects nothing from a transaction in a named root', () => {
  const { editor, note } = createNoteEditor('main hello');
  editor.update.selection.set({ path: [0, 0], offset: 0 });
  editor.plugin(BaseFindPlugin).api.search('hello');
  const before = { main: editor.read.selection(), note: note.read.selection() };
  expect({
    selected: note.plugin(BaseFindPlugin).update.select(),
    selection: { main: editor.read.selection(), note: note.read.selection() },
  }).toEqual({ selected: false, selection: before });
});

test('selects in the main document from the main editor while the caret is in a named root', () => {
  const { editor, note } = createNoteEditor('main hello');
  note.update.selection.set({ path: [0, 0], offset: 2 });
  const find = editor.plugin(BaseFindPlugin);
  find.api.search('hello');
  expect({
    selected: find.update.select(),
    selection: editor.read.selection(),
  }).toEqual({
    selected: true,
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 10 },
    },
  });
});

test('publishes a failed rescan as no matches and the error in one write', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  const failure = new Error('Unavailable');
  const published: Array<{ count: number; error: Error | null }> = [];
  const stop = store.subscribe((state) => {
    published.push({ count: state.matches.length, error: state.error });
  });
  const find = spyOn(NodeApi, 'findTextRanges').mockImplementation(() => {
    throw failure;
  });
  try {
    editor.update.text.insert('!', { at: { path: [1, 0], offset: 13 } });
    expect(published).toEqual([{ count: 0, error: failure }]);
  } finally {
    stop();
    find.mockRestore();
  }
});

test('isolates concurrent editors and owns immutable result snapshots', () => {
  const first = createFindEditor();
  const second = createFindEditor();
  const owner = first.plugin(BaseFindPlugin);
  owner.api.search('hello');
  expect(second.plugin(BaseFindPlugin).store.get('count')).toBe(0);
  const matches = owner.store.get('matches');
  expect(Object.isFrozen(matches)).toBe(true);
  expect(Object.isFrozen(matches[0].range.anchor.path)).toBe(true);
  owner.api.search('world');
  expect(matches).toHaveLength(2);
  expect(owner.store.get('matches')).toHaveLength(1);
});

test('publishes a failure and recovers on a subsequent query', () => {
  const editor = createFindEditor();
  const { api, store } = editor.plugin(BaseFindPlugin);
  const failure = new Error('Unavailable');
  const find = spyOn(NodeApi, 'findTextRanges').mockImplementation(() => {
    throw failure;
  });
  try {
    api.search('hello');
  } finally {
    find.mockRestore();
  }
  expect(store.get('error')).toBe(failure);
  expect(store.get('count')).toBe(0);
  api.search('world');
  expect(store.get('error')).toBeNull();
  expect(store.get('count')).toBe(1);
});

test('searches the whole document again at the first edit after a failed search', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  const find = spyOn(NodeApi, 'findTextRanges').mockImplementation(() => {
    throw new Error('Unavailable');
  });
  try {
    api.search('hello');
  } finally {
    find.mockRestore();
  }
  editor.update.text.insert('!', { at: { path: [1, 0], offset: 7 } });
  expect({
    activeText: activeText(editor),
    error: store.get('error'),
    results: results(editor),
  }).toEqual({
    activeText: 'hello a',
    error: null,
    results: freshResults(editor, 'hello'),
  });
});

test('falls back to the whole search when the search of a changed block throws', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'hello c');
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  api.move(1);
  const search = NodeApi.findTextRanges;
  let failed = false;
  const find = spyOn(NodeApi, 'findTextRanges').mockImplementation(
    (root, query, options) => {
      if (failed) return search(root, query, options);
      failed = true;
      throw new Error('Unavailable');
    }
  );
  try {
    editor.update.text.insert('hello ', { at: { path: [1, 0], offset: 0 } });
  } finally {
    find.mockRestore();
  }
  expect({
    activeText: activeText(editor),
    error: store.get('error'),
    results: results(editor),
  }).toEqual({
    activeText: 'hello hello b',
    error: null,
    results: freshResults(editor, 'hello'),
  });
});

test('drops a match across an element in the commit that stops the schema treating it as inline', () => {
  const slot = defineRuntimePluginSlot('find-schema');
  const articleSchema = (inline: boolean) =>
    defineEditorSchema('find-schema', {
      id: 'find-schema',
      elements: {
        mixed: {
          content: schema.content.any([
            schema.content.text(),
            schema.content.type('token'),
          ]),
        },
        token: { content: schema.content.text(), inline },
      },
      root: schema.content.type('mixed'),
      unknown: 'reject',
      version: inline ? 1 : 2,
    });
  const editor = createEditor({
    initialValue: [
      {
        type: 'mixed',
        children: [
          { text: 'a' },
          { type: 'token', children: [{ text: 'b' }] },
          { text: 'c' },
        ],
      },
      { type: 'mixed', children: [{ text: 'elsewhere' }] },
    ],
    plugins: [slot.of(articleSchema(true)), BaseFindPlugin],
  });
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('abc');
  const found = store.get('count');
  editor.update.plugins.reconfigure(slot, articleSchema(false));
  expect({ found, after: store.get('count') }).toEqual({ found: 1, after: 0 });
});

test('drops a match across an inline element in the commit that turns it into a block', () => {
  const Mixed = definePlugin('findFlipMixed', {
    schema: {
      element: {
        content: schema.content.any([
          schema.content.text(),
          schema.content.type('link'),
          schema.content.type('paragraph'),
        ]),
      },
    },
  });
  const editor = createEditor({
    initialValue: [
      {
        type: 'findFlipMixed',
        children: [
          { text: 'a' },
          {
            type: 'link',
            url: 'https://platejs.org',
            children: [{ text: 'b' }],
          },
          { text: 'c' },
        ],
      },
    ],
    plugins: [BaseFindPlugin, BaseLinkPlugin, Mixed],
  });
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('abc');
  const found = store.get('count');
  editor.update.nodes.set({ type: 'paragraph' } as never, { at: [0, 1] });
  expect({ found, after: store.get('count') }).toEqual({ found: 1, after: 0 });
});

test('finds a match across a block in the commit that turns it into an inline element', () => {
  const Mixed = definePlugin('findFlipMixed', {
    schema: {
      element: {
        content: schema.content.any([
          schema.content.text(),
          schema.content.type('link'),
          schema.content.type('paragraph'),
        ]),
      },
    },
  });
  const editor = createEditor({
    initialValue: [
      {
        type: 'findFlipMixed',
        children: [
          { text: 'a' },
          { type: 'paragraph', children: [{ text: 'b' }] },
          { text: 'c' },
        ],
      },
    ],
    plugins: [BaseFindPlugin, BaseLinkPlugin, Mixed],
  });
  const { api, store } = editor.plugin(BaseFindPlugin);
  api.search('abc');
  const found = store.get('count');
  editor.update.nodes.set(
    { type: 'link', url: 'https://platejs.org' } as never,
    { at: [0, 1] }
  );
  expect({ found, after: store.get('count') }).toEqual({ found: 0, after: 1 });
});

test('refreshes nothing on later commits after a clear in an update that threw', () => {
  const editor = createParagraphEditor('hello a', 'hello b', 'plain');
  const { api } = editor.plugin(BaseFindPlugin);
  api.search('hello');
  const [source] = getPlateDecorationSources(editor);
  const refreshes: unknown[] = [];
  const stop = source.observe!({
    editor,
    refresh: (input) => refreshes.push(input),
  });
  try {
    expect(() =>
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [2, 0], offset: 5 } });
        api.search('');
        throw new Error('Rejected');
      })
    ).toThrow('Rejected');
    editor.update.selection.set({ path: [2, 0], offset: 0 });
    refreshes.length = 0;
    editor.update.text.insert('x', { at: { path: [2, 0], offset: 5 } });
    editor.update.selection.set({ path: [0, 0], offset: 0 });
    expect(refreshes).toEqual([]);
  } finally {
    stop();
  }
});

test('paints matches only on the document it searched', () => {
  const editor = createFindEditor();

  editor.plugin(BaseFindPlugin).api.search('hello');
  const [source] = getPlateDecorationSources(editor);
  const view = createEditorView(editor, {
    document: {
      children: [{ type: 'paragraph', children: [{ text: 'other words' }] }],
    },
  });

  expect(
    source.read({ editor, entry: editor.read.nodes.get([0, 0])! })
  ).toHaveLength(1);
  expect(
    source.read({ editor: view, entry: view.read.nodes.get([0, 0])! })
  ).toEqual([]);
});
