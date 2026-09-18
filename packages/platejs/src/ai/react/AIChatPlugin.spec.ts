import { describe, expect, it } from 'bun:test';

import { BaseParagraphPlugin, editorCommands } from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

describe('AIChatPlugin', () => {
  it('installs its AI, history, and Markdown dependencies once', () => {
    const editor = createEditor({
      plugins: [AIChatPlugin],
      userId: 'alice',
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    expect(names.indexOf('ai')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.indexOf('markdown')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.filter((name) => name === 'ai')).toHaveLength(1);
    expect(names.filter((name) => name === 'history')).toHaveLength(1);
    expect(names.filter((name) => name === 'markdown')).toHaveLength(1);
  });

  it('stops streaming while retaining the draft anchor', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(AIChatPlugin).store.set({ streaming: true });
    editor.plugin(AIChatPlugin).store.set({ _blockKey: editor.key([0])! });

    editor.plugin(AIChatPlugin).api.stop();

    expect(editor.plugin(AIChatPlugin).store.get('streaming')).toBe(false);
    expect(editor.plugin(AIChatPlugin).store.get('_blockKey')).toBe(
      editor.key([0])
    );
  });

  it('dismisses an unaccepted draft without changing content or history', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [{ children: [{ text: 'draft' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
    const value = editor.read.value();
    const history = editor.read.history().undos;
    const ai = editor.plugin(AIChatPlugin);
    ai.api.show();
    ai.store.set({ _requestId: 'dismissed', streaming: true });
    ai.api.setPreview('Unaccepted response', { requestId: 'dismissed' });
    expect(ai.store.get('previewValue')).toHaveLength(1);

    editor.plugin(AIChatPlugin).api.hide({ focus: false });

    expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(false);
    expect(ai.store.get('previewValue')).toEqual([]);
    expect(ai.store.get('streaming')).toBe(false);
    expect(ai.store.get('_blockKey')).toBeNull();
    expect(ai.store.get('_requestId')).toBeNull();
    expect(editor.read.value()).toEqual(value);
    expect(editor.read.history().undos).toEqual(history);
    ai.api.setPreview('Late response', { requestId: 'dismissed' });
    expect(ai.store.get('previewValue')).toEqual([]);
  });

  it('matches the selection updated earlier in the active transaction', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      userId: 'alice',
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: 'occupied' }], type: 'paragraph' },
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

    expect(editor.plugin(AIChatPlugin).store.get('open')).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'occupied' }], type: 'paragraph' },
    ]);
  });
});
