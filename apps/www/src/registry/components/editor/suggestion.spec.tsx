import { describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import { editorCommands } from 'platejs';
import { AuthoredPlugin, projectAuthoredDocument } from 'platejs/authored';
import { createEditor, EditorContent, EditorRoot } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';

import { AIKit } from './ai';
import { SuggestionKit } from './suggestion';

const toastErrorMock = mock();

mock.module('sonner', () => ({
  toast: { error: toastErrorMock },
}));

const value = [
  { children: [{ text: 'Accepted' }], type: 'paragraph' },
] as const;

const joinAroundMovedLine = [
  { children: [{ text: 'cd' }], type: 'paragraph' },
  {
    authored: [
      {
        at: 1,
        author: 'erin',
        change: '~edit:erin',
        follows: JSON.stringify(['carol:1', 1]),
        kind: 'insert',
      },
    ],
    children: [{ text: 'ab' }],
    type: 'paragraph',
  },
  {
    authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }],
    children: [{ text: 'ef' }],
    type: 'paragraph',
  },
];

describe('SuggestionKit', () => {
  it('shares one authored extension identity with AIKit', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: [...AIKit, ...SuggestionKit],
      userId: 'alice',
    });

    expect(editor.plugin(AuthoredPlugin).read.view()).toEqual({
      intent: 'edit',
    });
  });

  it('uses the package plugin over native authored changes', () => {
    const editor = createEditor({
      initialValue: value,
      plugins: SuggestionKit,
      userId: 'alice',
    });
    const suggestion = editor.plugin(SuggestionPlugin);
    const authored = editor.plugin(AuthoredPlugin);

    expect(suggestion.installed).toBe(true);
    expect(suggestion.read.mode()).toBe('editing');
    expect(authored.read.view()).toEqual({ intent: 'edit' });

    suggestion.api.setMode('suggesting');
    editor.update.text.insert(' proposed', {
      at: { offset: 8, path: [0, 0] },
    });

    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'accepted' })
        .document.children
    ).toEqual([{ children: [{ text: 'Accepted' }], type: 'paragraph' }]);
    expect(suggestion.read.mode()).toBe('suggesting');
    expect(authored.read.view()).toEqual({ intent: 'propose' });
    expect(authored.read.changes().items).toEqual([
      expect.objectContaining({ authorId: 'alice', kind: 'insert' }),
    ]);
  });

  it('tells an Editing writer to decide the suggestion a refused change sits beside', () => {
    toastErrorMock.mockClear();
    const editor = createEditor({
      initialValue: joinAroundMovedLine,
      plugins: SuggestionKit,
      userId: 'alice',
    });

    render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [2, 0] },
        focus: { offset: 1, path: [2, 0] },
      });
      tx.command(editorCommands.insertBreak);
    });

    expect(editor.read.children()).toEqual(joinAroundMovedLine);
    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith(
      'Editing cannot record this change next to a pending suggestion yet. Accept or reject that suggestion first.',
      { id: 'suggestion-refusal' }
    );
  });

  it('tells a Suggesting writer why an edit over moved content refuses instead of sending them to Editing', () => {
    toastErrorMock.mockClear();
    const editor = createEditor({
      initialValue: joinAroundMovedLine,
      plugins: SuggestionKit,
      userId: 'alice',
    });

    render(
      <EditorRoot authored={{ intent: 'propose' }} editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 0, path: [2, 0] },
      });
      tx.command(editorCommands.insertText, { text: 'Z' });
    });

    expect(editor.read.children()).toEqual(joinAroundMovedLine);
    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith(
      'This edit would cover content a pending join shows elsewhere; decide the join first.',
      { id: 'suggestion-refusal' }
    );
  });

  it('keeps presentation optional', () => {
    const plain = createEditor({ initialValue: value });

    expect(plain.plugin(SuggestionPlugin).installed).toBe(false);
  });
});
