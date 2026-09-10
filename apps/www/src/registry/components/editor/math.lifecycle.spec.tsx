import { expect, it } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import { InlineEquationPlugin } from 'platejs/math/react';
import { createEditor, Plate, PlateContent } from 'platejs/react';
import * as React from 'react';

import { MathKit } from './math';

const setup = (isInline = true) => {
  const editor = createEditor({
    plugins: MathKit,
    initialValue: isInline
      ? [
          {
            type: 'paragraph',
            children: [
              { text: 'Before ' },
              { type: 'inlineEquation', latex: 'x', children: [{ text: '' }] },
              { text: ' after' },
            ],
          },
        ]
      : [{ type: 'equation', latex: 'x', children: [{ text: '' }] }],
  });
  const view = render(
    <Plate editor={editor}>
      <PlateContent />
    </Plate>
  );
  fireEvent.click(view.getByRole('button', { name: 'Edit equation' }), {
    detail: 1,
  });
  return { editor, view };
};

it('commits a local equation draft once and restores it with one undo', async () => {
  const { editor, view } = setup();
  const input = await view.findByPlaceholderText('E = mc^2');
  const priorCommit = editor.read.lastCommit();
  fireEvent.change(input, { target: { value: 'x^2 + y^2' } });
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({ latex: 'x' });
  expect(editor.read.lastCommit()).toBe(priorCommit);
  fireEvent.click(view.getByRole('button', { name: 'Done' }));
  await waitFor(() =>
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      latex: 'x^2 + y^2',
    })
  );
  act(() => editor.update.history.undo());
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({ latex: 'x' });
  act(() => editor.update.history.redo());
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
    latex: 'x^2 + y^2',
  });
  view.unmount();
});

it('keeps block equation edits local until Done and discards them on Escape', async () => {
  const { editor, view } = setup(false);
  const input = within(await view.findByRole('dialog')).getByRole('textbox');
  fireEvent.change(input, { target: { value: 'discarded' } });
  expect(editor.read.nodes.get([0])?.[0]).toMatchObject({ latex: 'x' });
  await act(async () => {
    fireEvent.keyDown(input, { key: 'Escape', keyCode: 27, which: 27 });
  });
  expect(editor.read.nodes.get([0])?.[0]).toMatchObject({ latex: 'x' });
  await waitFor(() =>
    expect(
      view
        .getByRole('button', { name: 'Edit equation' })
        .getAttribute('aria-expanded')
    ).toBe('false')
  );
  fireEvent.click(view.getByRole('button', { name: 'Edit equation' }), {
    detail: 1,
  });
  const reopened = within(await view.findByRole('dialog')).getByRole('textbox');
  fireEvent.change(reopened, { target: { value: 'saved' } });
  fireEvent.click(view.getByRole('button', { name: 'Done' }));
  await waitFor(() =>
    expect(editor.read.nodes.get([0])?.[0]).toMatchObject({ latex: 'saved' })
  );
  view.unmount();
});

it('does not overwrite an external equation update when Escape discards the draft', async () => {
  const { editor, view } = setup();
  const input = await view.findByPlaceholderText('E = mc^2');
  fireEvent.change(input, { target: { value: 'discard me' } });
  act(() =>
    editor
      .plugin(InlineEquationPlugin)
      .update.set({ latex: 'external' }, { at: [0, 1] })
  );
  await waitFor(() =>
    expect((input as HTMLTextAreaElement).value).toBe('external')
  );
  fireEvent.keyDown(input, { key: 'Escape', keyCode: 27, which: 27 });
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
    latex: 'external',
  });
  view.unmount();
});

it('does not submit an equation while native composition is active', async () => {
  const { editor, view } = setup();
  const input = await view.findByPlaceholderText('E = mc^2');
  fireEvent.change(input, { target: { value: 'draft' } });
  fireEvent.keyDown(input, {
    isComposing: true,
    key: 'Enter',
    keyCode: 13,
    which: 13,
  });
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({ latex: 'x' });
  expect(view.queryByPlaceholderText('E = mc^2')).toBeTruthy();
  fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
  expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({ latex: 'draft' });
  view.unmount();
});
