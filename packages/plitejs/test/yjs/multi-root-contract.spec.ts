import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { history } from '../../src/history';
import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  property,
  type Element,
  schema,
} from '../../src/index';
import type { AnyEditor } from '../../src/interfaces/editor';
import {
  createYjsNode,
  readPliteValueFromYjs,
} from '../../src/yjs/core/document';
import { yjs } from '../../src/yjs/core/plugin';
import {
  createYjsTestEditor,
  readEditorYjsState,
  undoEditorHistory,
} from './support/collaboration';

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});

const media = (captionRoot?: string, text = '', title?: string): Element => ({
  ...(captionRoot ? { childRoots: { caption: captionRoot } } : {}),
  children: [{ text }],
  ...(title ? { title } : {}),
  type: 'media',
});

const ContentRootSchema = defineEditorSchema('schema:yjs-content-root', {
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      properties: { title: property.string() },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'yjs-content-root',
  root: schema.content.types(['media', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const SharedCaptionSchema = defineEditorSchema('schema:yjs-shared-caption', {
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'shared',
        },
      },
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'yjs-shared-caption',
  root: schema.content.types(['media', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
  version: 1,
});

const createPeer = (
  doc: Y.Doc,
  _clientId: string
): {
  cleanup: () => void;
  doc: Y.Doc;
  editor: AnyEditor;
} => {
  const editor = createYjsTestEditor({ children: [media()] });
  const cleanup = editor.install(
    yjs({
      doc,
      initialReady: true,
      ...(doc.getMap('document:schema').size === 0 ? { seed: true } : {}),
    })
  );

  return { cleanup, doc, editor };
};

const createContentRootPeer = (
  doc: Y.Doc,
  _clientId: string
): {
  cleanup: () => void;
  doc: Y.Doc;
  editor: AnyEditor;
} => {
  const editor = createEditor({
    plugins: [ContentRootSchema, history()],
    initialValue: [paragraph('Body')],
  });
  const cleanup = editor.install(
    yjs({
      doc,
      initialReady: true,
      ...(doc.getMap('document:schema').size === 0 ? { seed: true } : {}),
    })
  );

  return { cleanup, doc, editor };
};

const sync = (source: { doc: Y.Doc }, target: { doc: Y.Doc }): void => {
  Y.applyUpdate(
    target.doc,
    Y.encodeStateAsUpdate(source.doc, Y.encodeStateVector(target.doc))
  );
};

const joinPeer = (
  doc: Y.Doc,
  plugins: readonly unknown[],
  seeded?: unknown
): { doc: Y.Doc; editor: AnyEditor } => {
  const editor = createEditor({
    initialValue: (seeded ?? [paragraph('')]) as never,
    plugins: plugins as never,
  });

  editor.install(
    yjs({ doc, initialReady: true, ...(seeded ? { seed: true } : {}) })
  );

  return { doc, editor };
};

const authoredBy = (authorId: string, intent: 'edit' | 'propose') => {
  let count = 0;

  return createAuthoredPlugin({
    authorId,
    createChangeId: () => `${authorId}:${(count += 1)}`,
    intent,
    now: () => 1,
  });
};

const rootsOf = (peer: { doc: Y.Doc; editor: AnyEditor }) => [
  Object.keys(peer.editor.read.value().roots ?? {}),
  [...peer.doc.getMap('document:roots').keys()],
];

describe('plitejs/yjs multi-root document contract', () => {
  it('owns the whole runtime when installed from a named-root view', () => {
    const doc = new Y.Doc();
    const runtime = createYjsTestEditor({
      children: [paragraph('Body')],
      roots: { header: [paragraph('Header')] },
    });
    const main = createEditorView(runtime);
    const header = createEditorView(runtime, { root: 'header' });
    const cleanup = header.install(
      yjs({
        doc,
        initialReady: true,
        seed: true,
      })
    );

    main.update.text.insert('!', {
      at: { offset: 4, path: [0, 0] },
    });
    header.update.text.insert('!', {
      at: { offset: 6, path: [0, 0] },
    });

    assert.deepEqual(readPliteValueFromYjs(doc.getXmlElement('document')), [
      paragraph('Body!'),
    ]);
    assert.deepEqual(
      readPliteValueFromYjs(
        doc.getMap<Y.XmlElement>('document:roots').get('header')!
      ),
      [paragraph('Header!')]
    );

    cleanup();
  });

  it('lowers a commit that changes two roots one root at a time', () => {
    const editor = createYjsTestEditor({
      children: [paragraph('Body')],
      roots: { header: [paragraph('Header')] },
    });
    const cleanup = editor.install(
      yjs({ doc: new Y.Doc(), initialReady: true, seed: true })
    );
    const seen = readEditorYjsState(editor).trace().length;

    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 4, path: [0, 0] } });
      tx.roots.replace('header', [paragraph('Header'), paragraph('More')]);
    });

    assert.deepEqual(
      readEditorYjsState(editor)
        .trace()
        .slice(seen)
        .map((entry) => 'changedRanges' in entry),
      [true, true]
    );

    cleanup();
  });

  it('reconciles only the named root whose import fell back', () => {
    const doc = new Y.Doc();
    const editor = createYjsTestEditor({
      children: [paragraph('Body')],
      roots: { header: [paragraph('Header')] },
    });
    const cleanup = editor.install(
      yjs({ doc, initialReady: true, seed: true })
    );
    const header = doc.getMap<Y.XmlElement>('document:roots').get('header')!;
    const main = editor.read.children();
    const seen = readEditorYjsState(editor).trace().length;

    doc.transact(() => {
      header.setAttribute('provider:metadata', 'opaque');
      header.insert(1, [createYjsNode(paragraph('Remote'))]);
    });

    assert.equal(editor.read.children(), main);
    assert.deepEqual(editor.read.root('header'), [
      paragraph('Header'),
      paragraph('Remote'),
    ]);
    assert.deepEqual(readEditorYjsState(editor).trace().slice(seen), [
      {
        changedChildren: 1,
        fallback: 'remote-event-root-attributes',
        importKind: 'full-diff-fallback',
        mode: 'remote-reconcile',
        root: 'header',
      },
    ]);

    cleanup();
  });

  it('synchronizes an offscreen named root without mounting a root view', () => {
    const source = createPeer(new Y.Doc(), 'source');
    const targetDoc = new Y.Doc();

    source.editor.update.roots.create('caption:media-1', [
      paragraph('Caption'),
    ]);
    sync(source, { doc: targetDoc });

    const target = createPeer(targetDoc, 'target');
    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Caption'),
    ]);

    source.editor.update.roots.replace('caption:media-1', [
      paragraph('Edited offscreen'),
    ]);
    sync(source, target);

    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Edited offscreen'),
    ]);

    source.cleanup();
    target.cleanup();
  });

  it('publishes and undoes owner and child-root changes atomically', () => {
    const source = createContentRootPeer(new Y.Doc(), 'source');
    const targetDoc = new Y.Doc();

    sync(source, { doc: targetDoc });

    const target = createContentRootPeer(targetDoc, 'target');
    let sourceUpdates = 0;
    let targetCommits = 0;
    const onSourceUpdate = () => {
      sourceUpdates += 1;
    };
    const unsubscribeTarget = target.editor.subscribeCommit(() => {
      targetCommits += 1;
    });

    source.doc.on('update', onSourceUpdate);
    assert.equal(source.editor.read.schema.hasContentRoots(), true);
    source.editor.update((tx) => {
      tx.nodes.set(
        {
          childRoots: { caption: 'caption:media-1' },
          type: 'media',
        } as never,
        { at: [0] }
      );
      tx.roots.create('caption:media-1', [paragraph('Caption')]);
    });

    assert.equal(sourceUpdates, 1);

    sync(source, target);

    assert.equal(targetCommits, 1);
    assert.deepEqual(target.editor.read.children(), [
      media('caption:media-1', 'Body'),
    ]);
    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Caption'),
    ]);

    sourceUpdates = 0;
    targetCommits = 0;
    source.editor.update((tx) => {
      tx.nodes.set({ title: 'Hero' }, { at: [0] });
      tx.roots.replace('caption:media-1', [paragraph('Edited caption')]);
    });

    assert.equal(sourceUpdates, 1);

    sync(source, target);

    assert.equal(targetCommits, 1);
    assert.deepEqual(target.editor.read.children(), [
      media('caption:media-1', 'Body', 'Hero'),
    ]);
    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Edited caption'),
    ]);

    sourceUpdates = 0;
    targetCommits = 0;
    undoEditorHistory(source.editor);

    assert.equal(sourceUpdates, 1);

    sync(source, target);

    assert.equal(targetCommits, 1);
    assert.deepEqual(target.editor.read.children(), [
      media('caption:media-1', 'Body'),
    ]);
    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Caption'),
    ]);

    sourceUpdates = 0;
    targetCommits = 0;
    source.editor.update((tx) => {
      tx.nodes.set({ type: 'paragraph' }, { at: [0] });
    });

    assert.equal(sourceUpdates, 1);
    assert.deepEqual(source.editor.read.children(), [paragraph('Body')]);
    assert.deepEqual(source.editor.read.value().roots ?? {}, {});

    sync(source, target);

    assert.equal(targetCommits, 1);
    assert.deepEqual(target.editor.read.children(), [paragraph('Body')]);
    assert.deepEqual(target.editor.read.value().roots ?? {}, {});

    sourceUpdates = 0;
    targetCommits = 0;
    undoEditorHistory(source.editor);

    assert.equal(sourceUpdates, 1);
    assert.deepEqual(source.editor.read.children(), [
      media('caption:media-1', 'Body'),
    ]);
    assert.deepEqual(source.editor.read.root('caption:media-1'), [
      paragraph('Caption'),
    ]);

    sync(source, target);

    assert.equal(targetCommits, 1);
    assert.deepEqual(target.editor.read.children(), [
      media('caption:media-1', 'Body'),
    ]);
    assert.deepEqual(target.editor.read.root('caption:media-1'), [
      paragraph('Caption'),
    ]);

    source.doc.off('update', onSourceUpdate);
    unsubscribeTarget();
    source.cleanup();
    target.cleanup();
  });

  it('drops an owner and its root that one peer suggests and accepts deleting while another types in the root offline, in either delivery order', () => {
    for (const offlineFirst of [true, false]) {
      const decider = joinPeer(
        new Y.Doc(),
        [ContentRootSchema, authoredBy('bob', 'propose')],
        {
          children: [paragraph('Body'), media('caption:1', 'M')],
          roots: { 'caption:1': [paragraph('Inside')] },
        }
      );
      const offline = { doc: new Y.Doc() };

      sync(decider, offline);
      const typist = joinPeer(offline.doc, [
        ContentRootSchema,
        authoredBy('ann', 'edit'),
      ]);

      typist.editor.update((tx) => {
        tx.text.insert('x', {
          at: { offset: 0, path: [0, 0], root: 'caption:1' },
        });
      });
      assert.deepEqual(typist.editor.read.root('caption:1'), [
        paragraph('xInside'),
      ]);

      decider.editor.update((tx) => {
        tx.nodes.remove({ at: [1] });
      });
      const [deletion] = decider.editor.read.authored.changes().items;

      decider.editor.update.authored.decide({
        action: 'accept',
        changes: [deletion],
      });

      if (offlineFirst) {
        sync(typist, decider);
        sync(decider, typist);
      } else {
        sync(decider, typist);
        sync(typist, decider);
      }

      for (const peer of [decider, typist]) {
        assert.deepEqual(
          [peer.editor.read.children(), rootsOf(peer)],
          [[paragraph('Body')], [[], []]],
          `offline first: ${offlineFirst}`
        );
      }
    }
  });

  it('keeps a shared root whose two owners two peers remove at the same time, in an open schema', () => {
    const left = joinPeer(new Y.Doc(), [SharedCaptionSchema], {
      children: [
        media('caption:1', 'A'),
        media('caption:1', 'B'),
        paragraph('Body'),
      ],
      roots: { 'caption:1': [paragraph('Shared')] },
    });
    const right = { doc: new Y.Doc() };

    sync(left, right);
    const peers = [left, joinPeer(right.doc, [SharedCaptionSchema])];

    peers[0].editor.update((tx) => tx.nodes.remove({ at: [0] }));
    peers[1].editor.update((tx) => tx.nodes.remove({ at: [1] }));
    sync(peers[0], peers[1]);
    sync(peers[1], peers[0]);

    for (const peer of peers) {
      assert.deepEqual(
        [
          peer.editor.read.children(),
          peer.editor.read.root('caption:1'),
          rootsOf(peer),
        ],
        [
          [paragraph('Body')],
          [paragraph('Shared')],
          [['caption:1'], ['caption:1']],
        ],
        'an open schema keeps the shared root'
      );
    }
  });

  it('applies a remote edit to the main root after a local one, in a schema with content roots', () => {
    const left = createContentRootPeer(new Y.Doc(), 'left');
    const rightDoc = new Y.Doc();

    sync(left, { doc: rightDoc });
    const right = createContentRootPeer(rightDoc, 'right');

    left.editor.update((tx) => {
      tx.text.insert('x', { at: { offset: 4, path: [0, 0] } });
    });
    sync(left, right);
    right.editor.update((tx) => {
      tx.text.insert('y', { at: { offset: 5, path: [0, 0] } });
    });
    sync(right, left);

    for (const peer of [left, right]) {
      assert.deepEqual(
        peer.editor.read.children(),
        [paragraph('Bodyxy')],
        'each peer shows both letters'
      );
    }
    left.cleanup();
    right.cleanup();
  });
});
