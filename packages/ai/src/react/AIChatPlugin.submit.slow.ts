import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { type Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const createEditor = (sendMessage: ReturnType<typeof mock>) => {
  const initialValue: Value = [
    { children: [{ text: 'one' }], id: 'b1', type: 'p' },
    { children: [{ text: 'two' }], id: 'b2', type: 'p' },
  ];
  const editor = createPlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseAIPlugin,
      BlockSelectionPlugin,
      AIChatPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue,
  });
  const chat = {
    messages: [],
    sendMessage,
  } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

  editor.plugin(AIChatPlugin).store.set({ chat });

  return editor;
};

describe('AIChatPlugin submit', () => {
  it('returns early when both prompt and input are empty', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);

    editor.plugin(AIChatPlugin).api.submit('');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('undoes insert mode, stores selected blocks, and sends their context', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    editor.plugin(AIChatPlugin).store.set({ toolName: 'edit' });
    editor.plugin(AIChatPlugin).store.set({ open: true });
    editor
      .plugin(BlockSelectionPlugin)
      .store.set({ selectedIds: new Set(['b1', 'b2']) });
    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert({ ai: true, text: ' ai' }, { at: [0, 1] });
    });

    editor.plugin(AIChatPlugin).api.submit('draft', { mode: 'insert' });

    expect(editor.read.text.string([])).toBe('onetwo');
    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).store.get('toolName')).toBe('edit');
    expect(
      editor
        .plugin(AIChatPlugin)
        .store.get('chatNodes')
        .map((node) => node.id)
    ).toEqual(['b1', 'b2']);
    expect(editor.plugin(AIChatPlugin).store.get('chatSelection')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          ctx: expect.objectContaining({
            selection: expect.any(Object),
            toolName: 'edit',
          }),
        }),
      })
    );
  });
});
