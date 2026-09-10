import { act, render } from '@testing-library/react';
import * as React from 'react';

import type { Range } from '../../../core';
import type { CommentThread } from '../../../features/comments';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import {
  type Editor,
  createEditor,
  Plate,
  PlateContent,
  useEditor,
} from '../../core';
import { pipeHandler } from '../../utils/pipeHandler.internal';
import { CommentsPlugin } from './CommentsPlugin';

const firstRange: Range = {
  anchor: { offset: 1, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
};
const secondRange: Range = {
  anchor: { offset: 0, path: [1, 0] },
  focus: { offset: 2, path: [1, 0] },
};
const record = (id: string, range = firstRange): CommentThread => ({
  id,
  createdAt: '2026-09-09T12:00:00.000Z',
  excerpt: id,
  userId: 'alice',
  messages: [
    {
      id: `${id}-message`,
      userId: 'alice',
      createdAt: '2026-09-09T12:00:00.000Z',
      body: [{ type: 'paragraph', children: [{ text: 'Comment' }] }],
    },
  ],
  resolved: false,
  status: 'published',
  target: { type: 'range', range },
});
const setup = (initialThreads: readonly CommentThread[]) => {
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'Alpha' }], type: 'paragraph' },
      { children: [{ text: 'Beta' }], type: 'paragraph' },
    ],
    plugins: [
      CommentsPlugin.configure({
        initialState: { initialThreads, currentUserId: 'alice' },
      }),
    ],
  });
  return {
    editor,
    comments: editor.plugin(CommentsPlugin),
    source: getPlateDecorationSources(editor).find(
      ({ id }) => id === 'comments'
    )!,
  };
};

it('paints ordered overlaps and refreshes only the old and new active nodes', () => {
  const { editor, comments, source } = setup([
    record('first'),
    record('overlap', {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    }),
    record('second', secondRange),
  ]);
  const read = () =>
    source.read({ entry: [editor.read.nodes.get([0, 0])![0], [0, 0]] });
  expect(read().map(({ key }) => key)).toEqual([
    `first:${editor.key([0, 0])}`,
    `overlap:${editor.key([0, 0])}`,
  ]);
  expect(comments.api.idsAt({ path: [0, 0], offset: 3 })).toEqual([
    'first',
    'overlap',
  ]);
  const refresh = mock();
  const detach = source.observe!({ refresh });
  comments.api.setActive(['first']);
  refresh.mockClear();
  comments.api.setActive(['second']);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(new Set(refresh.mock.calls[0][0].nodeKeys)).toEqual(
    new Set([editor.key([0, 0]), editor.key([1, 0])])
  );
  comments.api.setActive(['first', 'overlap']);
  comments.api.setThreads([
    record('overlap'),
    record('first'),
    record('second', secondRange),
  ]);
  expect(comments.store.get('activeIds')).toEqual(['first', 'overlap']);
  expect(comments.api.idsAt({ path: [0, 0], offset: 3 })).toEqual([
    'overlap',
    'first',
  ]);
  comments.api.setThreads([record('overlap'), record('second', secondRange)]);
  expect(comments.store.get('activeIds')).toEqual(['overlap']);
  detach();
});

it('retains mapped data across observer fan-out, detachment and remount without duplicate commit refreshes', () => {
  const { editor, comments, source } = setup([record('first')]);
  const first = mock();
  const second = mock();
  const detachFirst = source.observe!({ refresh: first });
  const detachSecond = source.observe!({ refresh: second });
  comments.api.setActive(['first']);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
  detachFirst();
  comments.api.setActive([]);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(2);
  detachSecond();
  editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } });
  expect(comments.api.range('first')!.anchor.offset).toBe(2);
  const remount = mock();
  const detach = source.observe!({ refresh: remount });
  editor.update.text.insert('Y', { at: { path: [0, 0], offset: 0 } });
  expect(remount).not.toHaveBeenCalled();
  expect(comments.api.range('first')!.anchor.offset).toBe(3);
  const ranges = source.read({
    entry: [editor.read.nodes.get([0, 0])![0], [0, 0]],
  });
  expect(ranges).toHaveLength(1);
  expect(ranges[0].range).toEqual(comments.api.range('first'));
  detach();
});

it('keeps fully deleted comments reachable and restores their exact paint on undo', () => {
  const { editor, comments, source } = setup([record('first')]);
  editor.update({ history: 'new-batch' }, (tx) =>
    tx.text.delete({ at: { ...firstRange, kind: 'text' } })
  );
  const read = () =>
    source.read({ entry: [editor.read.nodes.get([0, 0])![0], [0, 0]] });
  expect(read()).toEqual([]);
  expect(comments.api.range('first')).toEqual({
    anchor: firstRange.anchor,
    focus: firstRange.anchor,
  });
  editor.update((tx) => tx.history.undo());
  expect(read()).toHaveLength(1);
  expect(read()[0].range).toEqual(firstRange);
  editor.update((tx) => tx.history.redo());
  expect(read()).toEqual([]);
});

it('activates the ordered group at the clicked point and clears outside comments', () => {
  const { editor, comments, source } = setup([
    record('first'),
    record('overlap', {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    }),
  ]);
  const root = document.createElement('div');
  const overlap = document.createElement('span');
  const plain = document.createElement('span');
  overlap.dataset.commentId = 'overlap';
  root.append(overlap, plain);
  const point = { path: [0, 0], offset: 3 };
  const resolve = spyOn(editor.api.dom, 'resolveEventRange').mockReturnValue({
    anchor: point,
    focus: point,
  });
  pipeHandler(editor, { handlerKey: 'onClick' })?.({
    currentTarget: root,
    target: overlap,
  });
  expect(comments.store.get('activeIds')).toEqual(['first', 'overlap']);
  expect(
    source
      .read({ entry: [editor.read.nodes.get([0, 0])![0], [0, 0]] })
      .map(({ attributes }) => attributes['data-comment-active'])
  ).toEqual(['', '']);
  pipeHandler(editor, { handlerKey: 'onClick' })?.({
    currentTarget: root,
    target: plain,
  });
  expect(comments.store.get('activeIds')).toEqual([]);
  resolve.mockRestore();
});

it('uses the current model selection and the calling view permissions', () => {
  const { editor, comments } = setup([]);
  const views: Editor[] = [];
  function Capture({
    index,
    readOnly = false,
  }: {
    index: number;
    readOnly?: boolean;
  }) {
    const view = useEditor();
    React.useLayoutEffect(() => {
      views[index] = view;
    }, [index, view]);
    return <PlateContent readOnly={readOnly} />;
  }
  const tree = (readOnly = false) => (
    <>
      <Plate editor={editor}>
        <Capture index={0} />
      </Plate>
      <Plate editor={editor} readOnly={readOnly}>
        <Capture index={1} readOnly={readOnly} />
      </Plate>
    </>
  );
  const view = render(tree());
  act(() => {
    views[0].update.selection.set({ ...firstRange, kind: 'text' });
    expect(views[0].plugin(CommentsPlugin).api.begin()).toBe(true);
  });
  expect(comments.api.pendingRange()).toEqual(firstRange);
  act(() => {
    views[1].update.selection.set({ ...secondRange, kind: 'text' });
    expect(views[1].plugin(CommentsPlugin).api.begin()).toBe(true);
  });
  expect(comments.api.pendingRange()).toEqual(secondRange);
  view.rerender(tree(true));
  act(() => {
    expect(views[1].plugin(CommentsPlugin).api.begin()).toBe(false);
  });
  expect(comments.api.pendingRange()).toEqual(secondRange);
  view.unmount();
  expect(comments.api.getSnapshot().pending).not.toBeNull();
});
