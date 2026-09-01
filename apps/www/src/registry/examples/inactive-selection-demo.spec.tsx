import { describe, expect, it } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plate, createEditor } from 'platejs/react';
import * as React from 'react';

import { BasicNodesKit } from '../components/editor/basic-nodes';
import { Editor } from '../components/editor/editor';

const value = [
  {
    type: 'paragraph',
    children: [{ text: 'Keep this selection live.' }],
  },
];

const setup = () => {
  const editor = createEditor({
    plugins: [...BasicNodesKit],
    initialValue: value,
  });
  const view = render(
    <Plate editor={editor}>
      <Editor aria-label="Editor" />
      <button data-plite-keep-selection-visible="" type="button">
        Keep selection visible
      </button>
      <button type="button">Outside control</button>
    </Plate>
  );

  return { editor, view };
};

describe('native inactive selection', () => {
  it('paints the canonical selection only while a marked control has focus', async () => {
    const { editor, view } = setup();
    const user = userEvent.setup({ document: globalThis.document });
    const textbox = view.getByRole('textbox', { name: 'Editor' });
    const owned = view.getByRole('button', {
      name: 'Keep selection visible',
    });
    const outside = view.getByRole('button', { name: 'Outside control' });
    const before = editor.read.children();

    await user.click(textbox);
    act(() => {
      editor.update.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
    });
    await user.click(owned);

    await waitFor(() =>
      expect(
        view.container.querySelector('[data-plite-inactive-selection]')
      ).toBeTruthy()
    );
    expect(
      view.container.querySelector('[data-plite-inactive-selection-caret]')
    ).toBeNull();
    expect(editor.read.children()).toEqual(before);

    await user.click(outside);

    await waitFor(() =>
      expect(
        view.container.querySelector('[data-plite-inactive-selection]')
      ).toBeNull()
    );
  });

  it('renders a caret instead of a fill for a collapsed selection', async () => {
    const { editor, view } = setup();
    const user = userEvent.setup({ document: globalThis.document });
    const textbox = view.getByRole('textbox', { name: 'Editor' });
    const owned = view.getByRole('button', {
      name: 'Keep selection visible',
    });

    await user.click(textbox);
    act(() => {
      editor.update.selection.set({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
    });
    await user.click(owned);

    await waitFor(() =>
      expect(
        view.container.querySelector('[data-plite-inactive-selection-caret]')
      ).toBeTruthy()
    );
    expect(
      view.container.querySelector('[data-plite-inactive-selection]')
    ).toBeNull();
  });
});
