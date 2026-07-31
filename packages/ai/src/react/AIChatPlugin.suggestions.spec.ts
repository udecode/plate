import { MarkdownPlugin } from '@platejs/markdown';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { BaseParagraphPlugin, NodeIdPlugin } from '@platejs/core';
import { SelectionApi, type TextSelection, type Value } from '@platejs/plite';
import { type TIdElement } from '@platejs/utils';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const SchemaOnlyNodeIdPlugin = NodeIdPlugin.configure({
  initialState: {
    initialValueIds: false,
    match: () => false,
  },
});

const createEditor = (
  value: Value,
  chatNodes: TIdElement[],
  selection: TextSelection | null = null
) =>
  createPlateEditor({
    plugins: [
      BaseParagraphPlugin,
      SchemaOnlyNodeIdPlugin,
      BaseAIPlugin,
      MarkdownPlugin,
      SuggestionPlugin,
      BlockSelectionPlugin,
      CursorOverlayPlugin,
      AIChatPlugin.configure({ initialState: { chatNodes } }),
    ],
    selection,
    initialValue: value,
  });

describe('AIChatPlugin suggestions', () => {
  it('replaces multi-block chat nodes and persists their selection ids', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], id: 'id-1', type: 'p' },
      { children: [{ text: 'old-b' }], id: 'id-2', type: 'p' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');

    expect(editor.plugin(AIChatPlugin).store.get('_replaceIds')).toEqual([
      'id-1',
      'id-2',
    ]);
    expect(
      editor.plugin(BlockSelectionPlugin).store.get('selectedIds')
    ).toEqual(new Set(['id-1', 'id-2']));
    expect(editor.read.text.string([])).toContain('next-a');
    expect(editor.read.text.string([])).toContain('next-b');
  });

  it('inserts expanded AI edits after the restored block selection', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], id: 'id-1', type: 'p' },
      { children: [{ text: 'old-b' }], id: 'id-2', type: 'p' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], id: 'tail', type: 'p' },
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

  it('replaces the selection from the owned preview value', () => {
    const chatNodes = [{ children: [{ text: 'old' }], id: 'id-1', type: 'p' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
      kind: 'text',
    });

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'new' }], type: 'p' }],
    });
    editor.plugin(AIChatPlugin).update.replaceSelection({ format: 'none' });

    expect(editor.read.text.string([])).toBe('new');
  });

  it('clears stale preview content before submitting another request', () => {
    const chatNodes = [{ children: [{ text: 'old' }], id: 'id-1', type: 'p' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'stale' }], type: 'p' }],
    });
    editor.plugin(AIChatPlugin).api.submit('continue');

    expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([]);
  });

  it('inserts fragment suggestions and selects transient text for one block', () => {
    const chatNodes = [{ children: [{ text: 'old' }], id: 'id-1', type: 'p' }];
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
