import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { documentAdmissionPoint } from '../../src/core/document-admission';
import { readCoreWork } from '../../src/core/work';
import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  DocumentChange,
  type EditorDocumentValue,
  schema,
} from '../../src/index';
import { getDefined } from '../../src/internal/get-defined';
import { getActiveYjsController } from '../../src/yjs/core/controller-registry';
import { readPliteValueFromYjs } from '../../src/yjs/core/document';
import { yjs } from '../../src/yjs/core/plugin';
import { getVisibleYjsNode } from './support/collaboration';

type Named = Readonly<{
  children: ReadonlyArray<{ text: string }>;
  name: string;
  type: 'paragraph';
}>;

const named = (name: string, text: string): Named => ({
  children: [{ text }],
  name,
  type: 'paragraph',
});

const Names = defineEditorSchema('schema:yjs-import-repair', {
  elements: { paragraph: { content: schema.content.text() } },
  root: schema.content.not(schema.content.text()),
  roots: { header: schema.content.not(schema.content.text()) },
  unknown: 'preserve',
});

const rootsOf = (value: EditorDocumentValue) => [
  ['main', value.children],
  ...Object.entries(value.roots ?? {}).sort(([a], [b]) => (a < b ? -1 : 1)),
];

/**
 * Keeps each block's `name` on its first holder in document order, `main`
 * first, and renames every later holder, as a unique repair does.
 */
const renameRepeats = (after: EditorDocumentValue) => {
  const taken = new Set<string>();
  let renamed = false;
  const rename = (blocks: readonly unknown[]) =>
    blocks.map((block) => {
      const { name } = block as Named;
      let next = name;

      while (taken.has(next)) next = `${next}'`;
      taken.add(next);
      renamed ||= next !== name;

      return next === name ? block : { ...(block as Named), name: next };
    });
  const roots = Object.fromEntries(
    rootsOf(after).map(([root, blocks]) => [
      root,
      rename(blocks as readonly unknown[]),
    ])
  );

  if (!renamed) return null;

  const { main, ...others } = roots;
  const repaired = {
    ...after,
    children: main,
    ...(after.roots ? { roots: others } : {}),
  } as EditorDocumentValue;

  return DocumentChange.between(after, repaired);
};

const UniqueNames = definePlugin('unique-names', {
  contributions: [
    documentAdmissionPoint.of({
      commit: ({ after }) => renameRepeats(after),
      load: () => null,
    }),
  ],
});

const roomOf = (editor: ReturnType<typeof peer>) =>
  getDefined(getActiveYjsController(editor)).debugRoot();

const headerOf = (doc: Y.Doc) =>
  doc.getMap('document:roots').get('header') as Y.XmlElement;

const peer = (doc: Y.Doc, seeded?: EditorDocumentValue) => {
  const editor = createEditor({
    initialValue: (seeded ?? { children: [named('', '')] }) as never,
    plugins: [Names, UniqueNames] as never,
  });

  editor.install(
    yjs({ doc, initialReady: true, ...(seeded ? { seed: true } : {}) })
  );

  return editor;
};

const send = (from: Y.Doc, to: Y.Doc) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));

const room = (value: EditorDocumentValue) => {
  const first = new Y.Doc();
  const second = new Y.Doc();
  const editors = [peer(first, value)];

  send(first, second);
  editors.push(peer(second));

  return { docs: [first, second], editors };
};

describe('plitejs/yjs import repairs', () => {
  it('writes the name a repair gives the second copy into the room as an attribute of its element, with no whole-root reconcile, in both delivery orders', () => {
    for (const order of [
      [0, 1],
      [1, 0],
    ]) {
      const { docs, editors } = room({
        children: [named('a', 'x'), named('b', 'y')],
      });
      const [ann, bob] = editors;

      getDefined(ann).update((tx) => {
        tx.nodes.insert(named('c', 'A') as never, { at: [2] });
      });
      getDefined(bob).update((tx) => {
        tx.nodes.insert(named('c', 'B') as never, { at: [0] });
      });

      const written = getVisibleYjsNode(roomOf(getDefined(ann)), [2]);
      const { reconciles } = readCoreWork();
      const [from, to] = order as [number, number];

      send(getDefined(docs[from]), getDefined(docs[to]));
      send(getDefined(docs[to]), getDefined(docs[from]));

      const expected = [
        named('c', 'B'),
        named('a', 'x'),
        named('b', 'y'),
        named("c'", 'A'),
      ];

      assert.deepEqual(
        {
          editors: editors.map((editor) => editor.read.value().children),
          kept: getVisibleYjsNode(roomOf(getDefined(ann)), [3]) === written,
          reconciles: readCoreWork().reconciles - reconciles,
          rooms: editors.map((editor) => readPliteValueFromYjs(roomOf(editor))),
        },
        {
          editors: [expected, expected],
          kept: true,
          reconciles: 0,
          rooms: [expected, expected],
        },
        `${order}`
      );
    }
  });

  it('writes the name a repair gives a copy in another root into that root’s element when the update reaches a peer as a whole-document import', () => {
    const { docs, editors } = room({
      children: [named('a', 'x')],
      roots: { header: [named('h', 'z')] },
    });
    const [ann, bob] = editors;

    getDefined(ann).update((tx) => {
      tx.nodes.insert(named('c', 'A') as never, { at: [1] });
    });
    createEditorView(getDefined(bob), { root: 'header' }).update((tx) => {
      tx.nodes.insert(named('c', 'B') as never, { at: [1] });
    });
    getDefined(bob).update((tx) => {
      tx.nodes.insert(named('d', 'B') as never, { at: [0] });
    });

    const written = getVisibleYjsNode(headerOf(getDefined(docs[1])), [1]);
    const { reconciles } = readCoreWork();

    send(getDefined(docs[1]), getDefined(docs[0]));
    send(getDefined(docs[0]), getDefined(docs[1]));

    const expected = {
      children: [named('d', 'B'), named('a', 'x'), named('c', 'A')],
      roots: { header: [named('h', 'z'), named("c'", 'B')] },
    };

    assert.deepEqual(
      {
        editors: editors.map((editor) => {
          const { children, roots } = editor.read.value();

          return { children, roots };
        }),
        kept: getVisibleYjsNode(headerOf(getDefined(docs[1])), [1]) === written,
        reconciles: readCoreWork().reconciles - reconciles,
        rooms: docs.map((doc, index) => ({
          children: readPliteValueFromYjs(roomOf(getDefined(editors[index]))),
          roots: { header: readPliteValueFromYjs(headerOf(doc)) },
        })),
      },
      {
        editors: [expected, expected],
        kept: true,
        reconciles: 0,
        rooms: [expected, expected],
      }
    );
  });
});
