import { expect, it } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import { createEditor, EditorContent, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from './basic-blocks';
import { DetailsKit } from './details';
import { TocKit } from './toc';

const createTocEditor = () =>
  createEditor({
    plugins: [...BasicBlocksKit, ...DetailsKit, ...TocKit],
    initialValue: [
      { children: [{ text: '' }], type: 'toc' },
      {
        children: [
          { children: [{ text: 'Outer' }], type: 'summary' },
          {
            children: [
              { children: [{ text: 'Setup' }], level: 2, type: 'summary' },
              { children: [{ text: 'Steps' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
        type: 'details',
      },
    ],
  });

it('opens the collapsed Details around a TOC target before flashing it [EDIT-TOC-NAV-001]', async () => {
  const view = render(
    <EditorRoot editor={createTocEditor()}>
      <EditorContent />
    </EditorRoot>
  );

  fireEvent.click(view.getByRole('button', { name: 'Setup' }));

  await waitFor(() =>
    expect(
      view.container.querySelector('[data-nav-target="true"]')?.textContent
    ).toBe('Setup')
  );
  expect(view.queryByText('Steps')).toBeNull();
  view.unmount();
});

it('shows a renamed heading in the TOC', () => {
  const editor = createEditor({
    plugins: [...BasicBlocksKit, ...TocKit],
    initialValue: [
      { children: [{ text: '' }], type: 'toc' },
      { children: [{ text: 'Intro' }], level: 1, type: 'heading' },
    ],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );

  act(() => {
    editor.update.text.insert(' notes', { at: { offset: 5, path: [1, 0] } });
  });

  expect(view.getByRole('button', { name: 'Intro notes' })).toBeTruthy();
  view.unmount();
});

it('opens the Details around a TOC target only in the view that jumped (R24)', async () => {
  const editor = createTocEditor();
  const view = render(
    <>
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent aria-label="A content" />
      </EditorRoot>
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent aria-label="B content" />
      </EditorRoot>
    </>
  );
  const outerToggle = (label: string) =>
    within(view.getByLabelText(label))
      .getAllByRole('button', { name: /details$/ })[0]
      .getAttribute('aria-expanded');

  await act(async () => {
    fireEvent.click(
      within(view.getByLabelText('A content')).getByRole('button', {
        name: 'Setup',
      })
    );
  });

  expect([outerToggle('A content'), outerToggle('B content')]).toEqual([
    'true',
    'false',
  ]);
  view.unmount();
});
