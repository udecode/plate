import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  createEditor as createPliteEditor,
  type Element,
  schema,
  SelectionApi,
  type TextSelection,
  type Value,
} from '@platejs/plite';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = (
  value: Value,
  chatNodes: Element[],
  selection: TextSelection | null = null
) => {
  const editor = createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      BaseParagraphPlugin,
      BaseAIPlugin,
      MarkdownPlugin,
      SuggestionPlugin,
      BlockSelectionPlugin,
      CursorOverlayPlugin,
      AIChatPlugin,
    ],
    selection,
    initialValue: value,
  });

  editor.plugin(AIChatPlugin).store.set({
    chatNodes: chatNodes.map((node, index) => ({
      node,
      nodeKey: editor.key([index])!,
    })),
  });

  return editor;
};

describe('AIChatPlugin suggestions', () => {
  it('replaces multi-block chat nodes and persists their selection ids', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');

    const replacementIds = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

    expect(replacementIds).toHaveLength(2);
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(new Set(replacementIds));
    expect(replacementIds.every((id) => editor.read.nodes.path(id))).toBe(true);
    expect(editor.read.text.string([])).toContain('next-a');
    expect(editor.read.text.string([])).toContain('next-b');
  });

  it('inserts expanded AI edits after the restored block selection', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor
      .plugin(AIChatPlugin)
      .update.applySuggestions('next-a\n\nnext-b\n\nnext-c\n\nnext-d', {
        split: true,
      });
    editor.plugin(AIChatPlugin).update.insertBelow();

    expect(
      editor.read.children().map((_, index) => editor.read.text.string([index]))
    ).toEqual([
      'old-a',
      'old-b',
      'next-a',
      'next-b',
      'next-c',
      'next-d',
      'tail',
    ]);
  });

  it('does not reuse a stale path when a chat source block is deleted', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.insertBelow();

    expect(editor.read.value()).toEqual(before);
  });

  it('does not mistake an identical sibling for a deleted chat source', () => {
    const chatNodes = [
      { children: [{ text: 'same' }], type: 'paragraph' },
      { children: [{ text: 'same' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'same' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.insertBelow();

    expect(editor.read.value()).toEqual(before);
  });

  it('aborts a streaming replacement when any target key is missing', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    const [firstKey] = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

    if (!firstKey) throw new Error('Expected a replacement key');

    editor.update.nodes.remove({ at: firstKey });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.applySuggestions('later-a\n\nlater-b');

    expect(editor.read.value()).toEqual(before);
  });

  it('aborts a single-block replacement when its source key is missing', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.update.nodes.remove({ at: [0] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.applySuggestions('replacement');

    expect(editor.read.value()).toEqual(before);
  });

  it('tracks only the blocks produced by its replacement groups', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        {
          [SUGGESTION_TRANSIENT_KEY]: true,
          children: [{ text: 'unrelated' }],
          type: 'paragraph',
        },
      ],
      chatNodes
    );
    const unrelatedKey = editor.key([2])!;

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');

    const replacementKeys = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

    expect(replacementKeys).toHaveLength(2);
    expect(replacementKeys).not.toContain(unrelatedKey);
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedKeys')
    ).toEqual(new Set(replacementKeys));
  });

  it('keeps streaming when the replacement block count changes', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);
    const aiChat = editor.plugin(AIChatPlugin);

    aiChat.update.applySuggestions('next-a\n\nnext-b\n\nnext-c');

    expect(aiChat.store.get('_replaceNodeKeys')).toHaveLength(3);

    aiChat.update.applySuggestions('last-a\n\nlast-b\n\nlast-c\n\nlast-d');

    expect(aiChat.store.get('_replaceNodeKeys')).toHaveLength(4);
    expect(
      editor.read
        .children()
        .map((_, index) =>
          editor.read.text
            .string([index])
            .endsWith(['last-a', 'last-b', 'last-c', 'last-d'][index]!)
        )
    ).toEqual([true, true, true, true]);
  });

  it('captures chat source identity in its named root', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const RootHolderPlugin = defineBasePlugin('aiRootHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.type('paragraph', {
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
    const editor = createPlateEditor({
      editor: createPliteEditor<Value>(),
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        MarkdownPlugin,
        SuggestionPlugin,
        BlockSelectionPlugin,
        CursorOverlayPlugin,
        AIChatPlugin,
        RootHolderPlugin,
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0], root: 'header' },
        focus: { offset: 5, path: [1, 0], root: 'header' },
        kind: 'text',
      },
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'aiRootHolder',
          },
        ],
        roots: { header: structuredClone(chatNodes) },
      },
    });
    editor.plugin(AIChatPlugin).api.submit('edit');

    const snapshots = editor.plugin(AIChatPlugin).store.get('chatNodes');

    expect(snapshots.map(({ root }) => root)).toEqual(['header', 'header']);
    expect(
      snapshots.map(({ nodeKey }) => editor.read.nodes.get(nodeKey)?.[0])
    ).toEqual([...editor.read.root('header')]);

    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.applySuggestions('replacement');

    expect(editor.read.value()).toEqual(before);
  });

  it('replaces the selection from the owned preview value', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
      kind: 'text',
    });

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'new' }], type: 'paragraph' }],
    });
    editor.plugin(AIChatPlugin).update.replaceSelection({ format: 'none' });

    expect(editor.read.text.string([])).toBe('new');
  });

  it('clears stale preview content before submitting another request', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'stale' }], type: 'paragraph' }],
    });
    editor.plugin(AIChatPlugin).api.submit('continue');

    expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([]);
  });

  it('inserts fragment suggestions and selects transient text for one block', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });

    editor.plugin(AIChatPlugin).update.applySuggestions('done');

    const transientNodes = editor.read.nodes.toArray({
      at: [],
      mode: 'lowest',
      match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
    });
    const transientRange = editor.read.ranges.fromEntries(transientNodes);

    if (!transientRange) throw new Error('Expected transient suggestion range');

    expect(
      editor.read.nodes.some({
        at: [],
        match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
      })
    ).toBe(true);
    expect(editor.read.selection()).toEqual(SelectionApi.text(transientRange));
  });
});
