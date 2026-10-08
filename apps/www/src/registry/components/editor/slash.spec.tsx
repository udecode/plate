import { expect, test } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { BaseCodeBlockPlugin } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { AuthoredPlugin } from 'platejs/authored';
import {
  createEditor,
  type Editor,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
  useEditor,
} from 'platejs/react';
import { SlashPlugin } from 'platejs/slash-command/react';
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

  const { triggerQuery } = editor.plugin(SlashPlugin).store.get();

  expect(triggerQuery?.(editor)).toBe(true);
});

test.each(['', 'After'])(
  'opens AI with Enter and consumes only the query before %j',
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
        AuthoredPlugin,
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
    });

    for (const data of '/a') {
      await act(async () => {
        root.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data,
            inputType: 'insertText',
          })
        );
      });
    }

    await screen.findByRole('option', { name: 'AI' });
    fireEvent.keyDown(root, { code: 'Enter', key: 'Enter' });

    await waitFor(() => {
      expect(viewEditor!.plugin(AIChatPlugin).store.get('open')).toBe(true);
      expect(viewEditor!.read.text.string([1])).toBe(remainingText);
    });
  }
);
