/** @jsx jsxt */

import { ElementApi, schema } from '../../../core';
import { jsxt } from '../../../testing';
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

  it('regenerates copied element ids and rejects explicit duplicates', () => {
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
    expect(() =>
      editor.update((tx) =>
        tx.nodes.insert({
          children: [{ text: 'duplicate' }],
          id: 'source',
          type: 'paragraph',
        })
      )
    ).toThrow(/duplicate element id "source"/i);
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
    expect(() =>
      editor.update((tx) => {
        tx.nodes.insert({
          children: [{ text: 'duplicate' }],
          id: 'source',
          type: 'paragraph',
        });
      })
    ).toThrow('Duplicate element ID "source" at main:[0] and main:[2].');
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
