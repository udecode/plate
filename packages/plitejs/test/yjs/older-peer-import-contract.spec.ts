import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  property,
  schema,
} from '../../src/index';
import { setYjsAttribute } from '../../src/yjs/core/attributes';
import { createYjsPeerWithEditor } from './support/collaboration';

const element = (type: string, children: Descendant[]) => ({
  children,
  type,
});

const schemaFor = (contentRoots: boolean) =>
  defineEditorSchema(`schema:older-peer-import-${contentRoots}`, {
    elements: {
      paragraph: { content: schema.content.text() },
      t0: { content: schema.content.text() },
      ...(contentRoots
        ? {
            portal: {
              content: schema.content.text({ default: 'text', min: 1 }),
              contentRoots: {
                body: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive' as const,
                },
              },
            },
          }
        : {}),
    },
    id: `older-peer-import-${contentRoots}`,
    properties: [schema.textProperty('bold', property.boolean())],
    root: schema.content.types(['paragraph', 't0'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });

const peerWith = (contentRoots: boolean, children: Descendant[]) => {
  const peer = createYjsPeerWithEditor(
    createEditor({ plugins: [schemaFor(contentRoots)] }),
    { children, clientId: 'current' }
  );
  const older = new Y.Doc();

  Y.applyUpdate(older, Y.encodeStateAsUpdate(peer.doc));

  return {
    older,
    olderRoot: older.get('document', Y.XmlElement),
    peer,
    sync: () =>
      Y.applyUpdate(
        peer.doc,
        Y.encodeStateAsUpdate(older, Y.encodeStateVector(peer.doc))
      ),
  };
};

const yElement = (type: string) => {
  const node = new Y.XmlElement('element');

  setYjsAttribute(node, 'type', type);

  return node;
};

describe('plitejs/yjs older peer import', () => {
  for (const contentRoots of [false, true]) {
    const label = contentRoots ? 'with content roots' : 'without content roots';

    it(`imports an empty element and a bold empty line as canonical ${label}`, () => {
      const { olderRoot, peer, sync } = peerWith(contentRoots, [
        element('paragraph', [{ text: 'a' }]),
      ]);
      const line = yElement('paragraph');
      const boldEmpty = new Y.XmlText();

      setYjsAttribute(boldEmpty, 'bold', true);
      line.insert(0, [boldEmpty]);
      olderRoot.insert(1, [yElement('t0'), line]);
      sync();

      assert.deepEqual(peer.editor.read.children(), [
        element('paragraph', [{ text: 'a' }]),
        element('t0', [{ text: '' }]),
        element('paragraph', [{ text: '' }]),
      ]);
      peer.cleanup();
    });

    it(`imports an older peer's edit emptying a bold text as a plain line ${label}`, () => {
      const { older, olderRoot, peer, sync } = peerWith(contentRoots, [
        element('paragraph', [{ bold: true, text: 'ab' }]),
        element('paragraph', [{ text: 'c' }]),
      ]);
      const text = (olderRoot.get(0) as Y.XmlElement).get(0) as Y.XmlText;

      older.transact(() => {
        text.delete(0, 2);
        setYjsAttribute(text, 'bold', true);
      });
      sync();

      assert.deepEqual(peer.editor.read.children(), [
        element('paragraph', [{ text: '' }]),
        element('paragraph', [{ text: 'c' }]),
      ]);

      peer.editor.update((tx) => {
        tx.text.insert('x', { at: { offset: 1, path: [1, 0] } });
      });

      assert.deepEqual(peer.editor.read.children(), [
        element('paragraph', [{ text: '' }]),
        element('paragraph', [{ text: 'cx' }]),
      ]);
      peer.cleanup();
    });
  }
});
