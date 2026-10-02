// Run from the repository root:
// bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-10-01-dnd-transfer/substrate.probe.ts
import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  defineEffect,
  definePlugin,
  type Descendant,
  type Element,
  ElementApi,
  property,
  schema,
  SelectionApi,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';

import {
  registerEditorTransactionGuard,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../../../../packages/plitejs/src/core/public-state';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});
const texts = (editor: any) =>
  editor.read.children().map((node: any) => node.children?.[0]?.text ?? node.type);
const run = (label: string, fn: () => unknown) => {
  try {
    console.log(label, JSON.stringify(fn()));
  } catch (error) {
    console.log(label, 'threw', (error as Error).message);
  }
};
const inRoot = <T>(editor: unknown, root: string, fn: () => T) =>
  withEditorUpdateRoot(editor as never, root as never, () =>
    withEditorUpdateRootChildren(editor as never, root as never, fn)
  );

const portalSchema = defineEditorSchema('schema:dnd-transfer-probe', {
  elements: {
    portal: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.types(['portal', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'dnd-transfer-probe',
  root: schema.content.types(['portal', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});
const portal = (root: string) => ({
  childRoots: { body: root },
  children: [{ text: '' }],
  type: 'portal' as const,
});

run('T1 maxLength cut is reported as success', () => {
  const editor = createEditor({ initialValue: [paragraph('A')], maxLength: 3 });
  let inserted: unknown;
  editor.update((tx) => {
    inserted = tx.slice.replace(ContentSlice.closed([paragraph('WXYZ')]), {
      at: { anchor: { offset: 1, path: [0, 0] }, focus: { offset: 1, path: [0, 0] } },
    });
  });
  return { inserted, texts: texts(editor) };
});

run('T2 slice.replace at an existing block path merges text', () => {
  const editor = createEditor({ initialValue: [paragraph('A'), paragraph('B')] });
  editor.update((tx) => {
    tx.slice.replace(ContentSlice.closed([paragraph('X')]), { at: [1] });
  });
  return texts(editor);
});

run('T3 a spec built in a read and never applied publishes nothing', () => {
  const editor = createEditor({ initialValue: [paragraph('A'), paragraph('B')] });
  let commits = 0;
  const unsubscribe = editor.subscribe?.(() => {
    commits += 1;
  });
  const spec = editor.read((state: any) =>
    state.transaction((tx: any) => tx.nodes.remove({ at: SelectionApi.nodes([[0]]) }))
  );
  unsubscribe?.();
  return { commits, specBuilt: !!spec, texts: texts(editor) };
});

const anchored = () => {
  const editor = createEditor({
    initialValue: [paragraph('alpha'), paragraph('bravo'), paragraph('charlie')],
  });
  const anchor = editor.anchor(
    { anchor: { path: [0, 0], offset: 1 }, focus: { path: [0, 0], offset: 3 } },
    { association: 'inward', deletion: 'nearest' }
  );
  return { anchor, editor, key: editor.key([0]) };
};

run('T4 same-root tx.nodes.move keeps key and range anchor', () => {
  const { anchor, editor, key } = anchored();
  editor.update((tx) => tx.nodes.move({ at: [0], to: [2] }));
  return { anchor: anchor.resolve(), keyKept: editor.key([2]) === key, texts: texts(editor) };
});

run('T5 same-root remove plus insert of the same object keeps key, collapses anchor', () => {
  const { anchor, editor, key } = anchored();
  const node = editor.read.nodes.get([0])?.[0] as Element;
  editor.update((tx) => {
    tx.nodes.remove({ at: SelectionApi.nodes([[0]]) });
    tx.nodes.insert(node, { at: [2] });
  });
  return { anchor: anchor.resolve(), keyKept: editor.key([2]) === key, texts: texts(editor) };
});

run('T6 moving a portal into its own body commits an unreachable cycle', () => {
  const editor = createEditor({
    initialValue: {
      children: [paragraph('top'), portal('ex:1')] as Descendant[],
      roots: { 'ex:1': [paragraph('inside')] },
    },
    plugins: [portalSchema],
  });
  const node = editor.read.nodes.get([1])?.[0] as Element;
  editor.update((tx) => {
    tx.nodes.remove({ at: SelectionApi.nodes([[1]]) });
    inRoot(editor, 'ex:1', () => tx.nodes.insert(node, { at: [1] }));
  });
  return editor.read.value();
});

run('T7 an ancestor and its descendant in one remove-plus-insert payload duplicate', () => {
  const editor = createEditor({
    initialValue: [
      { type: 'blockquote', children: [paragraph('inner'), paragraph('other')] } as Element,
      paragraph('after'),
    ],
  });
  const parent = editor.read.nodes.get([0])?.[0] as Element;
  const child = editor.read.nodes.get([0, 0])?.[0] as Element;
  editor.update((tx) => {
    tx.nodes.remove({ at: SelectionApi.nodes([[0]]) });
    tx.nodes.insert([parent, child], { at: [1] });
  });
  return JSON.stringify(editor.read.value()).match(/inner/g)?.length;
});

const sessionEffect = defineEffect<string>({
  history: { replay: () => ({ reason: 'source-gone', status: 'blocked' }) },
  key: 'dnd-transfer-probe.undo',
});

run('T8 a session history effect cannot share an update with content', () => {
  const editor = createEditor({
    initialValue: [paragraph('')],
    plugins: [history(), definePlugin('dnd-transfer-probe', { effectTypes: [sessionEffect] })],
  });
  editor.update((tx) => {
    tx.nodes.insert(paragraph('landed'), { at: [1] });
    tx.effects.emit(sessionEffect, 'source');
  });
  return texts(editor);
});

const blocked = async () => {
  const editor = createEditor({
    initialValue: [paragraph('')],
    plugins: [history(), definePlugin('dnd-transfer-probe', { effectTypes: [sessionEffect] })],
  });
  editor.update({ history: 'new-batch' }, (tx) => {
    tx.text.insert('typed', { at: { offset: 0, path: [0, 0] } });
  });
  editor.update({ history: 'new-batch' }, (tx) => {
    tx.nodes.insert(paragraph('landed'), { at: [1] });
  });
  editor.update((tx) => tx.effects.emit(sessionEffect, 'source'));
  const results = [];
  for (let i = 0; i < 3; i++) {
    results.push((await editor.api.history.undo()).status);
  }
  console.log('T9 a blocked effect-only entry wedges earlier undo', JSON.stringify({ results, texts: texts(editor) }));
};

await blocked();

const boom = definePlugin('dnd-transfer-probe-boom', {
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ tx }) {
        const last = tx.nodes.children().at(-1);
        if (ElementApi.isElement(last) && JSON.stringify(last).includes('BOOM')) {
          throw new Error('post-correction refusal');
        }
      },
    },
  ],
});

await (async () => {
  const editor = createEditor({ initialValue: [paragraph('A')], plugins: [history(), boom] });
  let error = '';
  try {
    editor.update((tx) => tx.nodes.insert(paragraph('BOOM'), { at: [1] }));
  } catch (e) {
    error = (e as Error).message;
  }
  const undo = (await editor.api.history.undo()).status;
  console.log('T10 a throw after corrections rolls back with nothing published', JSON.stringify({ error, texts: texts(editor), undo }));
})();

run('T11 slice extraction drops a copy-drop id that a raw node keeps', () => {
  let nextId = 0;
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'source' }], id: 'keep-me', type: 'paragraph' } as Element],
    plugins: [
      defineEditorSchema('schema:dnd-transfer-probe-ids', {
        elements: { paragraph: { content: schema.content.text({ default: 'text', min: 1 }) } },
        properties: [
          schema.elementProperty('id', property.string({ generate: () => `p${(nextId += 1)}` }), {
            copy: 'drop',
            split: 'drop',
            target: target.group('element'),
          }),
        ],
        root: schema.content.type('paragraph'),
        unknown: 'reject',
      }),
    ],
  });
  const slice = editor.read((state: any) => state.slice.get({ at: SelectionApi.nodes([[0]]) }));
  return { rawId: (editor.read.nodes.get([0])?.[0] as any).id, sliceId: (slice as any)?.content?.[0]?.id ?? null };
});

run('T12 maxLength counts a same-update move twice', () => {
  const editor = createEditor({ initialValue: [paragraph('AAAAA'), paragraph('BBBBB')], maxLength: 10 });
  let inserted: unknown;
  editor.update((tx) => {
    tx.nodes.remove({ at: SelectionApi.nodes([[0]]) });
    inserted = tx.slice.replace(ContentSlice.closed([paragraph('AAAAA')]), {
      at: { anchor: { offset: 5, path: [0, 0] }, focus: { offset: 5, path: [0, 0] } },
    });
  });
  return { inserted, texts: texts(editor) };
});

run('T13 a cross-parent tx.nodes.move collapses a range anchor', () => {
  const editor = createEditor({
    initialValue: [
      paragraph('alpha'),
      { type: 'blockquote', children: [paragraph('quoted')] } as Element,
    ],
  });
  const anchor = editor.anchor(
    { anchor: { path: [0, 0], offset: 1 }, focus: { path: [0, 0], offset: 3 } },
    { association: 'inward', deletion: 'nearest' }
  );
  const key = editor.key([0]);
  editor.update((tx) => tx.nodes.move({ at: [0], to: [1, 1] }));
  return { anchor: anchor.resolve(), keyKept: editor.read.nodes.get(key) !== undefined, value: editor.read.value() };
});

await (async () => {
  const editor = createEditor({ initialValue: [paragraph('A')], plugins: [history()] });
  const release = registerEditorTransactionGuard(editor as never, ({ after }) => {
    if (JSON.stringify(after).includes('REJECT')) throw new Error('guard refusal');
  });
  let error = '';
  try {
    editor.update((tx) => tx.nodes.insert(paragraph('REJECT'), { at: [1] }));
  } catch (e) {
    error = (e as Error).message;
  }
  const undo = (await editor.api.history.undo()).status;
  release?.();
  console.log('T14 a pre-publication guard rejection publishes nothing', JSON.stringify({ error, texts: texts(editor), undo }));
})();
