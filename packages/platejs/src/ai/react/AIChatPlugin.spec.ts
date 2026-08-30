import { describe, expect, it } from 'bun:test';

import {
  BaseParagraphPlugin,
  getPlateRuntime,
  editorCommands,
  type Value,
} from '../../core';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

describe('AIChatPlugin', () => {
  it('installs its AI and Markdown dependencies once', () => {
    const editor = createEditor({
      plugins: [AIChatPlugin],
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    expect(names.indexOf('ai')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.indexOf('markdown')).toBeLessThan(names.indexOf('aiChat'));
    expect(names.filter((name) => name === 'ai')).toHaveLength(1);
    expect(names.filter((name) => name === 'markdown')).toHaveLength(1);
  });

  it('clears internal streaming state when stop is called', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    editor.plugin(AIChatPlugin).store.set({ streaming: true });
    editor.plugin(AIChatPlugin).store.set({ _blockChunks: 'abc' });
    editor.plugin(AIChatPlugin).store.set({ _blockPath: [0] });
    editor.plugin(AIChatPlugin).store.set({ _mdxName: 'foo' });

    editor.plugin(AIChatPlugin).api.stop();

    expect(editor.plugin(AIChatPlugin).store.get('streaming')).toBe(false);
    expect(editor.plugin(AIChatPlugin).store.get('_blockChunks')).toBe('');
    expect(editor.plugin(AIChatPlugin).store.get('_blockPath')).toBeNull();
    expect(editor.plugin(AIChatPlugin).store.get('_mdxName')).toBeNull();
  });

  it('removes its anchor without adding history', () => {
    const initialValue: Value = [
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'aiChat' },
    ];
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      initialValue,
    });

    editor.plugin(AIChatPlugin).update({ history: 'skip' }).remove({ at: [] });

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.read.children()[0]?.type).toBe('paragraph');
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('hides and removes its anchor without adding history', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      initialValue: [
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'aiChat' },
      ],
    });

    editor.plugin(AIChatPlugin).api.hide({ focus: false, undo: false });

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.read.children()[0]?.type).toBe('paragraph');
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('matches the selection updated earlier in the active transaction', () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
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
