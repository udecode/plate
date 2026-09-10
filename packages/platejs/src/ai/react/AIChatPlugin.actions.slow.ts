import { describe, expect, it, mock } from 'bun:test';

import { BaseParagraphPlugin } from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const createActionEditor = () =>
  createEditor({
    plugins: [BaseParagraphPlugin, MarkdownPlugin, AIChatPlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Original' }] }],
  });

describe('AI operation actions', () => {
  it('reset cancels transport and removes the draft without undoing user content', () => {
    const editor = createActionEditor();
    const ai = editor.plugin(AIChatPlugin);
    const stop = mock();
    const clear = mock();
    ai.store.set({
      chat: {
        messages: [
          {
            id: 'm1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'answer' }],
          },
        ],
        stop,
        clear,
      } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>,
    });
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    });
    editor.update.text.insert(' user');
    const before = editor.read.value();
    const history = editor.read.history.undos().length;
    const id = ai.api.start();
    ai.api.receive(id, 'Generated');
    ai.api.reset();
    expect(stop).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(history);
    expect(ai.store.get('operation')).toBeNull();
    expect(ai.store.get('mode')).toBe('insert');
    expect(ai.store.get('toolName')).toBeNull();
    ai.api.receive(id, 'late');
    expect(ai.store.get('operation')).toBeNull();
  });

  it('Stop keeps a partial draft, rejects later frames and leaves Undo owned by the document', () => {
    const editor = createActionEditor();
    const ai = editor.plugin(AIChatPlugin);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    });
    const before = editor.read.value();
    const id = ai.api.start();
    ai.api.receive(id, 'Partial **text**');
    ai.api.stop();
    const draft = ai.store.get('operation');
    expect(draft?.status).toBe('ready');
    expect(draft?.partial).toBe(true);
    ai.api.receive(id, 'late');
    ai.api.finish(id);
    expect(ai.store.get('operation')).toBe(draft);
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('keeps an explicit transport error and draft without changing the document', () => {
    const editor = createActionEditor();
    const ai = editor.plugin(AIChatPlugin);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    });
    const before = editor.read.value();
    const id = ai.api.start();
    ai.api.receive(id, 'Partial answer');
    ai.api.error(id, new Error('Connection closed'));
    expect(ai.store.get('operation')?.status).toBe('error');
    expect(ai.store.get('operation')?.error).toBe('Connection closed');
    expect(ai.store.get('operation')?.source).toBe('Partial answer');
    expect(ai.api.accept()).toBe(false);
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.undos()).toHaveLength(0);
  });
});
