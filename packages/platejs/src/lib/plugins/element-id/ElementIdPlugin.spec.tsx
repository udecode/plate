/** @jsx jsxt */

import * as Y from 'yjs';

import { ContentSlice, ElementApi, schema, target } from '../../../core';
import { jsxt } from '../../../testing';
import { YjsPlugin } from '../../../yjs/react';
import { createEditor } from '../../editor';
import { definePlugin } from '../../plugin';
import { ElementIdPlugin } from './ElementIdPlugin';

jsxt;

const LinkPlugin = definePlugin('elementIdLink', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const RootPlugin = definePlugin('elementIdRoot', {
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        side: {
          content: schema.content.type('paragraph', { min: 1 }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

const createIdFactory = () => {
  let next = 0;

  return () => `element-${(next += 1)}`;
};

describe('ElementIdPlugin', () => {
  it('is opt-in and identifies every element but no text leaves', () => {
    const withoutIds = createEditor({
      initialValue: [{ children: [{ text: 'plain' }], type: 'paragraph' }],
    });

    expect(withoutIds.read.children()[0]).not.toHaveProperty('id');

    const editor = createEditor({
      initialValue: [
        {
          children: [
            { text: 'before' },
            { children: [{ text: 'link' }], type: 'elementIdLink' },
          ],
          type: 'paragraph',
        },
      ],
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
        LinkPlugin,
      ],
    });
    const paragraph = editor.read.children()[0];

    expect(ElementApi.isElement(paragraph)).toBe(true);
    if (!ElementApi.isElement(paragraph)) return;
    const link = paragraph.children[1];

    const paragraphId = paragraph.id;
    const paragraphKey = editor.key(paragraph);

    expect(paragraphId).toMatch(/^element-/);
    expect(editor.plugin(ElementIdPlugin).read.id(paragraphKey)).toBe(
      paragraphId
    );
    expect(ElementApi.isElement(link)).toBe(true);
    if (!ElementApi.isElement(link)) return;
    const linkId = link.id;

    expect(linkId).toMatch(/^element-/);
    expect(linkId).not.toBe(paragraphId);
    expect(paragraph.children[0]).not.toHaveProperty('id');
    if (typeof linkId !== 'string') throw new Error('Expected a link ID');
    expect(editor.plugin(ElementIdPlugin).read.entry(linkId)).toMatchObject({
      node: link,
      path: [0, 1],
      root: 'main',
    });
  });

  it('resolves persisted ids from live keys without a caller node lookup', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [ElementIdPlugin],
    });
    const key = editor.key([0]);

    if (!key) throw new Error('Expected a live element key');

    expect(editor.plugin(ElementIdPlugin).read.id(key)).toBe('source');

    editor.update((tx) => {
      tx.nodes.remove({ at: key });
    });

    expect(editor.plugin(ElementIdPlugin).read.id(key)).toBeUndefined();
  });

  it('regenerates copied element ids and gives an explicit duplicate a fresh one', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
      ],
    });

    editor.update((tx) => {
      tx.blocks.duplicate({ at: [0] });
    });
    const copiedId = editor.read.children()[1]?.id;

    expect(editor.read.children()[0]?.id).toBe('source');
    expect(copiedId).toMatch(/^element-/);
    expect(copiedId).not.toBe('source');

    editor.update((tx) =>
      tx.nodes.insert({
        children: [{ text: 'duplicate' }],
        id: 'source',
        type: 'paragraph',
      })
    );

    const inserted = editor.read.children()[2];

    expect(inserted?.id).toMatch(/^element-/);
    expect(inserted?.id).not.toBe(copiedId);
    expect(editor.plugin(ElementIdPlugin).read.entry('source')).toMatchObject({
      node: { children: [{ text: 'source' }] },
      path: [0],
    });
    expect(
      editor
        .plugin(ElementIdPlugin)
        .read.id(editor.key(inserted as never) as never)
    ).toBe(inserted?.id);
  });

  it('keeps the first holder of an id a loaded document repeats', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          { children: [{ text: 'first' }], id: 'shared', type: 'paragraph' },
          { children: [{ text: 'second' }], id: 'shared', type: 'paragraph' },
          {
            childRoots: { side: 'side' },
            children: [{ text: '' }],
            id: 'owner',
            type: 'elementIdRoot',
          },
        ],
        roots: {
          side: [
            { children: [{ text: 'side' }], id: 'shared', type: 'paragraph' },
          ],
        },
      },
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
        RootPlugin,
      ],
    });
    const elementId = editor.plugin(ElementIdPlugin);
    const second = editor.read.children()[1];
    const side = editor.read.value().roots?.side?.[0];

    expect(editor.read.children()[0]?.id).toBe('shared');
    expect(second?.id).toMatch(/^element-/);
    expect(side?.id).toMatch(/^element-/);
    expect(side?.id).not.toBe(second?.id);
    expect(elementId.read.entry('shared')?.path).toEqual([0]);
    expect(elementId.read.entry(String(side?.id))).toMatchObject({
      path: [0],
      root: 'side',
    });

    const reloaded = createEditor({
      initialValue: structuredClone(editor.read.value()),
      plugins: [ElementIdPlugin, RootPlugin],
    });

    expect(reloaded.read.value()).toEqual(editor.read.value());
    expect(
      reloaded.plugin(ElementIdPlugin).read.entry(String(second?.id))?.path
    ).toEqual([1]);
  });

  it('renames the block an undo brings back when another block took its id', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'a' }], id: 'a', type: 'paragraph' },
        { children: [{ text: 'b' }], id: 'b', type: 'paragraph' },
      ],
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
      ],
    });
    const elementId = editor.plugin(ElementIdPlugin);

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.set({ id: 'a' }, { at: [0] });
    });
    editor.api.history.undo();

    const [restored, kept] = editor.read.children();

    expect(restored?.children).toEqual([{ text: 'a' }]);
    expect(restored?.id).toMatch(/^element-/);
    expect(kept?.id).toBe('a');
    expect(elementId.read.entry('a')?.node.children).toEqual([{ text: 'b' }]);
    expect(elementId.read.id(editor.key(restored as never) as never)).toBe(
      restored?.id
    );
  });

  it('throws its non-empty error for an empty id a peer stores', () => {
    const sourceDoc = new Y.Doc();

    createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [
        ElementIdPlugin,
        YjsPlugin.create({ doc: sourceDoc, initialReady: true, seed: true }),
      ],
    });

    const peerDoc = new Y.Doc();
    const writer = new Y.Doc();

    Y.applyUpdate(peerDoc, Y.encodeStateAsUpdate(sourceDoc));
    Y.applyUpdate(writer, Y.encodeStateAsUpdate(sourceDoc));
    const peer = createEditor({
      plugins: [
        ElementIdPlugin,
        YjsPlugin.create({ doc: peerDoc, initialReady: true }),
      ],
    });

    writer.on('update', (update: Uint8Array) => {
      Y.applyUpdate(peerDoc, update);
    });

    writer.transact(() => {
      (
        writer.get('document', Y.XmlElement).get(0) as Y.XmlElement
      ).setAttribute('id', '');
    });

    const admission = peer.api.yjs.admissionStatus();

    expect(admission.state === 'error' && String(admission.cause)).toBe(
      'Error: Element ID at main:[0] must be a non-empty string.'
    );
    expect(peer.read.children()[0]?.id).toBe('source');
    sourceDoc.destroy();
    peerDoc.destroy();
    writer.destroy();
  });

  it('throws its non-empty error for an empty id, local or from a peer', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [ElementIdPlugin],
    });
    const empty = { children: [{ text: 'empty' }], id: '', type: 'paragraph' };

    expect(() =>
      editor.update((tx) => tx.nodes.insert(empty, { at: [1] }))
    ).toThrow('Element ID at main:[1] must be a non-empty string.');
    expect(() =>
      editor.update({ tags: ['collaboration'] }, (tx) =>
        tx.nodes.insert(empty, { at: [1] })
      )
    ).toThrow('Element ID at main:[1] must be a non-empty string.');
    expect(editor.read.children()).toHaveLength(1);
  });

  it('does not publish its persisted index for a rejected transaction', () => {
    let reject = true;
    const RejectTransactionPlugin = definePlugin('rejectElementIdTransaction', {
      dependencies: [ElementIdPlugin],
      on: {
        transactionChange: () => {
          if (reject) throw new Error('reject transaction');
        },
      },
    });
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [RejectTransactionPlugin],
    });

    expect(() =>
      editor.update((tx) => {
        tx.nodes.set({ id: 'discarded' }, { at: [0] });
      })
    ).toThrow('reject transaction');
    expect(editor.read.children()[0]?.id).toBe('source');

    reject = false;
    editor.update((tx) => {
      tx.nodes.insert({
        children: [{ text: 'other' }],
        id: 'other',
        type: 'paragraph',
      });
    });
    expect(editor.plugin(ElementIdPlugin).read.entry('source')?.path).toEqual([
      0,
    ]);
    expect(
      editor.plugin(ElementIdPlugin).read.entry('discarded')
    ).toBeUndefined();
  });

  it('keeps reverse lookup coherent across live and rejected drafts', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
      plugins: [ElementIdPlugin],
    });
    const elementId = editor.plugin(ElementIdPlugin);

    expect(elementId.read.entry('source')?.path).toEqual([0]);

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'before' }], id: 'before', type: 'paragraph' },
        { at: [0] }
      );

      expect(elementId.read.entry('source')?.path).toEqual([1]);
    });
    expect(elementId.read.entry('source')?.path).toEqual([1]);

    expect(() =>
      editor.update((tx) => {
        tx.nodes.insert(
          {
            children: [{ text: 'discarded' }],
            id: 'discarded',
            type: 'paragraph',
          },
          { at: [0] }
        );

        expect(elementId.read.entry('discarded')?.path).toEqual([0]);
        throw new Error('discard draft');
      })
    ).toThrow('discard draft');
    expect(elementId.read.entry('discarded')).toBeUndefined();
    expect(elementId.read.entry('source')?.path).toEqual([1]);

    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });

      expect(elementId.read.entry('source')?.path).toEqual([0]);
    });
    expect(elementId.read.entry('source')?.path).toEqual([0]);
  });

  it('finds the block that kept an id after an update read it while another block held it too, and after an undo', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'A' }], id: 'a', type: 'paragraph' },
        { children: [{ text: 'B' }], id: 'b', type: 'paragraph' },
      ],
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
      ],
    });
    const elementId = editor.plugin(ElementIdPlugin);
    const bKey = editor.key([1]);
    const lookups = () => ({
      entry: elementId.read.entry('b')?.key,
      id: bKey && elementId.read.id(bKey),
    });

    editor.update((tx) => {
      tx.nodes.set({ id: 'b' }, { at: [0] });
      elementId.read.entry('b');
    });
    const afterUpdate = lookups();

    editor.api.history.undo();

    expect({ afterUndo: lookups(), afterUpdate }).toEqual({
      afterUndo: { entry: bKey, id: 'b' },
      afterUpdate: { entry: bKey, id: 'b' },
    });
  });

  it('gives only blocks unique ids on a split and a paste when narrowed to blocks beside an inline element', () => {
    const QuotePlugin = definePlugin('elementIdQuote', {
      schema: {
        element: { content: schema.content.type('paragraph', { min: 1 }) },
      },
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [
            {
              children: [
                { text: 'ab' },
                { children: [{ text: 'link' }], type: 'elementIdLink' },
                { text: '' },
              ],
              id: 'a',
              type: 'paragraph',
            },
          ],
          id: 'q',
          type: 'elementIdQuote',
        },
        { children: [{ text: 'cd' }], id: 'b', type: 'paragraph' },
      ],
      plugins: [
        ElementIdPlugin.configure({
          initialState: { generateId: createIdFactory() },
        }),
        LinkPlugin,
        QuotePlugin,
      ],
      schema: {
        overrides: [
          schema.override(ElementIdPlugin, {
            properties: { id: { target: target.group('block') } },
          }),
        ],
      },
    });

    editor.update((tx) => {
      tx.nodes.split({ at: { offset: 1, path: [0, 0, 0] } });
    });
    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: [
            { children: [{ text: 'x' }], id: 'a', type: 'paragraph' },
            { children: [{ text: 'y' }], id: 'b', type: 'paragraph' },
          ],
          openEnd: 1,
          openStart: 1,
        }),
        { at: { offset: 1, path: [1, 0] } }
      );
    });

    const stored: Array<Readonly<{ id: unknown; type: string }>> = [];
    const visit = (nodes: readonly unknown[]) => {
      for (const node of nodes) {
        if (!ElementApi.isElement(node)) continue;
        stored.push({ id: node.id, type: node.type });
        visit(node.children);
      }
    };

    visit(editor.read.children());

    const blockIds = stored.flatMap(({ id, type }) =>
      type === 'elementIdLink' ? [] : [id]
    );

    expect({
      blockIds: new Set(blockIds.filter((id) => typeof id === 'string')).size,
      stored: stored.map(({ id, type }) =>
        type === 'elementIdLink' ? { id, type } : type
      ),
    }).toEqual({
      blockIds: 5,
      stored: [
        'elementIdQuote',
        'paragraph',
        'paragraph',
        { id: undefined, type: 'elementIdLink' },
        'paragraph',
        'paragraph',
      ],
    });
  });

  it('updates its index atomically when persisted ids move between roots', () => {
    const editor = createEditor({
      initialValue: {
        children: [
          {
            childRoots: { side: 'side' },
            children: [{ text: '' }],
            id: 'root-owner',
            type: 'elementIdRoot',
          },
          { children: [{ text: 'main' }], id: 'main-id', type: 'paragraph' },
        ],
        roots: {
          side: [
            { children: [{ text: 'side' }], id: 'side-id', type: 'paragraph' },
          ],
        },
      },
      plugins: [ElementIdPlugin, RootPlugin],
    });

    editor.update((tx) => {
      tx.value.replace({
        children: [
          {
            childRoots: { side: 'side' },
            children: [{ text: '' }],
            id: 'root-owner',
            type: 'elementIdRoot',
          },
          { children: [{ text: 'side' }], id: 'side-id', type: 'paragraph' },
        ],
        roots: {
          side: [
            { children: [{ text: 'main' }], id: 'main-id', type: 'paragraph' },
          ],
        },
      });
    });

    expect(editor.plugin(ElementIdPlugin).read.entry('main-id')).toMatchObject({
      node: { children: [{ text: 'main' }] },
      path: [0],
      root: 'side',
    });
    expect(editor.plugin(ElementIdPlugin).read.entry('side-id')).toMatchObject({
      node: { children: [{ text: 'side' }] },
      path: [1],
      root: 'main',
    });
  });

  it('removes the old persisted id when an element is replaced at one path', () => {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'before' }], id: 'before-id', type: 'paragraph' },
      ],
      plugins: [ElementIdPlugin],
    });

    editor.update((tx) => {
      tx.nodes.replace(
        { children: [{ text: 'after' }], id: 'after-id', type: 'paragraph' },
        { at: [0] }
      );
    });

    expect(
      editor.plugin(ElementIdPlugin).read.entry('before-id')
    ).toBeUndefined();
    expect(
      editor.plugin(ElementIdPlugin).read.entry('after-id')?.node.children
    ).toEqual([{ text: 'after' }]);
  });
});
