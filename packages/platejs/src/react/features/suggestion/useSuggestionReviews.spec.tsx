import { act, render } from '@testing-library/react';
import React from 'react';

import type { SuggestionReview } from '../../../features/suggestion/lib';
import { createEditor, Plate } from '../../core';
import { SuggestionPlugin } from './SuggestionPlugin';
import { useSuggestionReviews } from './useSuggestionReviews';

it('shares review snapshots across strict mounted readers and refreshes relevant changes', async () => {
  const editor = createEditor({
    plugins: [SuggestionPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'plain ' },
          {
            text: 'suggested',
            suggestion: true,
            suggestion_one: {
              id: 'one',
              createdAt: 1,
              type: 'insert',
              userId: 'alice',
            },
          },
        ],
      },
    ],
  });
  const snapshots = new Map<number, readonly SuggestionReview[]>();
  let publications = 0;
  function Reader({ id }: { id: number }) {
    const reviews = useSuggestionReviews();
    React.useEffect(() => {
      snapshots.set(id, reviews);
      publications += 1;
    }, [id, reviews]);
    return null;
  }
  const view = render(
    <React.StrictMode>
      <Plate editor={editor}>
        <Reader id={1} />
        <Reader id={2} />
      </Plate>
    </React.StrictMode>
  );
  expect(snapshots.get(1)).toBe(snapshots.get(2));
  expect(snapshots.get(1)?.map(({ id }) => id)).toEqual(['one']);
  publications = 0;
  await act(() =>
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 0 } })
  );
  expect(publications).toBe(0);
  await act(() =>
    editor.update.text.insert('y', { at: { path: [0, 1], offset: 0 } })
  );
  expect(publications).toBe(2);
  expect(snapshots.get(1)).toBe(snapshots.get(2));
  expect(snapshots.get(1)?.[0].changes[0].node).toMatchObject({
    text: 'ysuggested',
  });
  await act(() => editor.plugin(SuggestionPlugin).update.accept('one'));
  expect(snapshots.get(1)).toEqual([]);
  await act(() => editor.update.history.undo());
  expect(snapshots.get(1)?.map(({ id }) => id)).toEqual(['one']);
  view.unmount();
  publications = 0;
  editor.plugin(SuggestionPlugin).update.reject('one');
  expect(publications).toBe(0);
});
