import { expect, it } from 'bun:test';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { createEditor, EditorContent, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from './basic-blocks';
import { DetailsKit } from './details';
import { TocKit } from './toc';

it('opens the collapsed Details around a TOC target before flashing it [EDIT-TOC-NAV-001]', async () => {
  const editor = createEditor({
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
  const view = render(
    <EditorRoot editor={editor}>
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
