import { expect, test } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { BaseCodeBlockPlugin, editorCommands } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { DefaultAuthoredPlugin } from 'platejs/authored';
import {
  createEditor,
  type Editor,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
  useEditor,
} from 'platejs/react';
import { SlashInputPlugin } from 'platejs/slash-command/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import React from 'react';

import { SlashKit } from './slash';

test('allows the slash trigger when Code Block is not installed', () => {
  const editor = createEditor({
    plugins: [ParagraphPlugin, ...SlashKit],
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
  });

  editor.update((tx) => {
    tx.command(editorCommands.insertText, { text: '/' });
  });

  expect(editor.read.nodes.some({ type: SlashInputPlugin })).toBe(true);
});

test.each(['', 'After'])(
  'opens AI with Enter without forcing editor focus before %j',
  async (remainingText) => {
    let viewEditor: Editor | undefined;
    const CaptureEditor = () => {
      viewEditor = useEditor();

      return null;
    };
    const editor = createEditor({
      plugins: [
        ParagraphPlugin,
        BaseCodeBlockPlugin,
        DefaultAuthoredPlugin,
        AIChatPlugin,
        SuggestionPlugin,
        ...SlashKit,
      ],
      userId: 'alice',
      initialValue: [
        { children: [{ text: `Before ${remainingText}` }], type: 'paragraph' },
        { children: [{ text: 'Next block' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 7, path: [0, 0] },
        focus: { offset: 7, path: [0, 0] },
      },
    });
    const mounted = render(
      <EditorRoot editor={editor}>
        <EditorContent data-testid="editor" />
        <CaptureEditor />
      </EditorRoot>
    );
    const root = mounted.getByTestId('editor');

    await act(async () => {
      root.focus();
      viewEditor!.plugin(SuggestionPlugin).api.setMode('suggesting');
      viewEditor!.update.nodes.split({
        always: true,
        at: { offset: 7, path: [0, 0] },
        match: (node) => 'children' in node,
      });
      viewEditor!.update.selection.set({ offset: 0, path: [1, 0] });
      viewEditor!.update((tx) => {
        tx.command(editorCommands.insertText, { text: '/' });
      });
    });

    const input = await mounted.findByRole('combobox');
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });

    await waitFor(() => {
      expect(viewEditor!.plugin(AIChatPlugin).store.get('open')).toBe(true);
      expect(document.activeElement).not.toBe(root);
      expect(viewEditor!.read.text.string([1])).toBe(remainingText);
    });
  }
);
