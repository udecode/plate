import { expect, it } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import {
  createEditor,
  NavigationFeedbackPlugin,
  Plate,
  PlateContent,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { FootnoteKit } from './footnote';

it('projects navigation feedback onto copied footnote references and definitions', async () => {
  const editor = createEditor({
    plugins: FootnoteKit,
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'Reference ' },
          { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
          { text: '.' },
        ],
      },
      {
        type: 'footnoteDefinition',
        ref: '1',
        children: [
          { type: 'paragraph', children: [{ text: 'Definition body' }] },
        ],
      },
    ],
  });
  let mounted: ReturnType<typeof useEditor> | undefined;
  function Capture() {
    mounted = useEditor();
    return <PlateContent />;
  }
  const view = render(
    <Plate editor={editor}>
      <Capture />
    </Plate>
  );
  for (const path of [[0, 1], [1]]) {
    const key = editor.key(path);
    if (!key || !mounted) throw new Error('Missing mounted fixture');
    act(() => {
      mounted?.plugin(NavigationFeedbackPlugin).api.flashTarget({ key });
    });
    await waitFor(() => {
      const target = view.container.querySelector('[data-nav-target="true"]');
      expect(target?.getAttribute('data-nav-pulse')).not.toBeNull();
      expect(target?.textContent).toContain(
        path.length === 2 ? '[1]' : 'Definition body'
      );
      expect(
        view.container.querySelectorAll('[data-nav-target="true"]').length
      ).toBe(1);
    });
    act(() => {
      mounted?.plugin(NavigationFeedbackPlugin).api.clear();
    });
    await waitFor(() =>
      expect(
        view.container.querySelector('[data-nav-target="true"]')
      ).toBeNull()
    );
  }
  view.unmount();
});
