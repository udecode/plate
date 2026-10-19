/// <reference types="@testing-library/jest-dom" />

import { expect, test } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { FootnotePlugin } from 'platejs/footnote/react';
import {
  createEditor,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
} from 'platejs/react';
import React from 'react';

import { FootnoteKit } from './footnote';

const type = async (editable: HTMLElement, text: string) => {
  for (const data of text) {
    await act(async () => {
      editable.focus();
      editable.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType: 'insertText',
        })
      );
    });
  }
};

test('refuses a new footnote whose ref another writer defined while the popup was open', async () => {
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'Claim' }], type: 'paragraph' }],
    plugins: [ParagraphPlugin, ...FootnoteKit],
    selection: {
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
      kind: 'text',
    },
  });
  const { container } = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const editable = container.querySelector<HTMLElement>(
    '[contenteditable="true"]'
  )!;

  await type(editable, '[^1');

  const option = await waitFor(() =>
    screen.getByRole('option', { name: /New footnote/ })
  );

  act(() => {
    editor.update({ tags: 'collaboration' }, (tx) => {
      tx.plugin(FootnotePlugin).createDefinition({ focus: false, ref: '1' });
    });
  });

  fireEvent.click(option);

  expect(editor.read.text.string([0])).toBe('Claim[^1');
  expect(
    editor.read.nodes.some({ type: editor.plugin(FootnotePlugin).schema.type })
  ).toBe(false);
});
