import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  property,
  type Descendant,
  type Editor,
  schema,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import * as Y from 'yjs';

import { readPliteValueFromYjs } from '../src/core/document';
import { yjs } from '../src/core/extension';
import { undoEditorHistory } from './support/collaboration';

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const media = (
  captionRoot?: string,
  text = '',
  title?: string
): Descendant => ({
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

const createPeer = (
  doc: Y.Doc,
  clientId: string
): {
  cleanup: () => void;
  doc: Y.Doc;
  editor: Editor;
} => {
  const editor = createEditor({ initialValue: [media()] });
  const cleanup = editor.install(
    yjs({
      clientId,
      doc,
      rootName: '@platejs/plite',
    })
  );

  return { cleanup, doc, editor };
};

const createContentRootPeer = (
  doc: Y.Doc,
  clientId: string
): {
  cleanup: () => void;
  doc: Y.Doc;
  editor: Editor;
} => {
  const editor = createEditor({
    extensions: [history(), ContentRootSchema],
    initialValue: [paragraph('Body')],
  });
  const cleanup = editor.install(
    yjs({
      clientId,
      doc,
      rootName: '@platejs/plite',
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

describe('@platejs/yjs multi-root document contract', () => {
  it('owns the whole runtime when installed from a named-root view', () => {
    const doc = new Y.Doc();
    const runtime = createEditor({
      initialValue: {
        children: [paragraph('Body')],
        roots: { header: [paragraph('Header')] },
      },
    });
    const main = createEditorView(runtime);
    const header = createEditorView(runtime, { root: 'header' });
    const cleanup = header.install(
      yjs({
        doc,
        rootName: '@platejs/plite',
      })
    );

    main.update.text.insert('!', {
      at: { offset: 4, path: [0, 0] },
    });
    header.update.text.insert('!', {
      at: { offset: 6, path: [0, 0] },
    });

    assert.deepEqual(
      readPliteValueFromYjs(doc.getXmlElement('@platejs/plite')),
      [paragraph('Body!')]
    );
    assert.deepEqual(
      readPliteValueFromYjs(
        doc.getMap<Y.XmlElement>('@platejs/plite:roots').get('header')!
      ),
      [paragraph('Header!')]
    );

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
      sourceUpdates++;
    };
    const unsubscribeTarget = target.editor.subscribeCommit(() => {
      targetCommits++;
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
});
