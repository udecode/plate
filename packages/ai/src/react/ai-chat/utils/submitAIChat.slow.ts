import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin } from '@platejs/core';
import { type Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { submitAIChat } from './submitAIChat';

const createEditor = (sendMessage: ReturnType<typeof mock>) => {
  const editor = createPlateEditor<Value>({
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
    value: [
      { children: [{ text: 'one' }], id: 'b1', type: 'p' },
      { children: [{ text: 'two' }], id: 'b2', type: 'p' },
    ],
  });
  const chat = {
    messages: [],
    sendMessage,
  } as unknown as NonNullable<AIChatPluginConfig['options']['chat']>;

  editor.plugin(AIChatPlugin).setOption('chat', chat);

  return editor;
};

describe('submitAIChat', () => {
  it('returns early when both prompt and input are empty', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);

    submitAIChat(editor, '');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('undoes insert mode, stores selected blocks, and sends their context', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    editor.plugin(AIChatPlugin).setOption('toolName', 'edit');
    editor.plugin(AIChatPlugin).setOption('open', true);
    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['b1', 'b2']));
    withAIBatch(editor, (tx) => {
      tx.nodes.insert({ ai: true, text: ' ai' }, { at: [0, 1] });
    });

    submitAIChat(editor, 'draft', { mode: 'insert' });

    expect(editor.read.text.string([])).toBe('onetwo');
    expect(editor.plugin(AIChatPlugin).getOption('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).getOption('toolName')).toBe('edit');
    expect(
      editor
        .plugin(AIChatPlugin)
        .getOption('chatNodes')
        .map((node) => node.id)
    ).toEqual(['b1', 'b2']);
    expect(editor.plugin(AIChatPlugin).getOption('chatSelection')).toBeNull();
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
