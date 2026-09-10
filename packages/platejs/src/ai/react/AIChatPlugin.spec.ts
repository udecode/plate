import { describe, expect, it } from 'bun:test';

import {
  BaseParagraphPlugin,
  getPlateRuntime,
  editorCommands,
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

  it('stops the active request and keeps its partial source', () => {
    const editor = createEditor({ plugins: [AIChatPlugin] });
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.start();
    ai.api.receive(id, 'abc');
    ai.api.stop();
    expect(ai.store.get('operation')).toMatchObject({
      status: 'ready',
      source: 'abc',
      partial: true,
    });
  });

  it('hides a draft without a canonical commit or history change', () => {
    const editor = createEditor({ plugins: [AIChatPlugin] });
    const ai = editor.plugin(AIChatPlugin);
    const before = editor.read.children();
    const id = ai.api.start();
    ai.api.receive(id, 'draft');
    ai.api.hide({ focus: false });
    expect(ai.store.get('operation')).toBeNull();
    expect(editor.read.children()).toBe(before);
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
