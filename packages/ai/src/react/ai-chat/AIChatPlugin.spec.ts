import { describe, expect, it } from 'bun:test';

import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { editorCommands } from '@platejs/plite';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

describe('AIChatPlugin', () => {
  it('installs its AI dependency once', () => {
    const editor = createPlateEditor({
      plugins: [AIChatPlugin],
    });
    const keys = editor.runtime.pluginList.map((plugin) => plugin.key);

    expect(keys.indexOf('ai')).toBeLessThan(keys.indexOf('aiChat'));
    expect(keys.filter((key) => key === 'ai')).toHaveLength(1);
  });

  it('clears internal streaming state when stop is called', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      initialValue: [{ children: [{ text: 'x' }], type: 'p' }],
    });

    editor.plugin(AIChatPlugin).setOption('streaming', true);
    editor.plugin(AIChatPlugin).setOption('_blockChunks', 'abc');
    editor.plugin(AIChatPlugin).setOption('_blockPath', [0]);
    editor.plugin(AIChatPlugin).setOption('_mdxName', 'foo');

    editor.plugin(AIChatPlugin).api.stop();

    expect(editor.plugin(AIChatPlugin).getOption('streaming')).toBe(false);
    expect(editor.plugin(AIChatPlugin).getOption('_blockChunks')).toBe('');
    expect(editor.plugin(AIChatPlugin).getOption('_blockPath')).toBeNull();
    expect(editor.plugin(AIChatPlugin).getOption('_mdxName')).toBeNull();
  });

  it('matches the selection updated earlier in the active transaction', () => {
    const editor = createPlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: 'occupied' }], type: 'p' },
      ],
    });

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
      tx.command(editorCommands.insertText, {
        text: ' ',
      });
    });

    expect(editor.plugin(AIChatPlugin).getOption('open')).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'occupied' }], type: 'p' },
    ]);
  });
});
