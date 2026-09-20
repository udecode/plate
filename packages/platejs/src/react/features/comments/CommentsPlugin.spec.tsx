import { act, render } from '@testing-library/react';
import * as React from 'react';

import { DefaultAuthoredPlugin } from '../../../authored';
import type { Range } from '../../../core';
import {
  commentBody,
  commentsFixture,
  commentThread,
} from '../../../features/comments/__tests__/commentsFixture';
import { getPlateDecorationSources } from '../../../internal/plugin/getPlateDecorationSources';
import {
  type Editor,
  createEditor,
  EditorRoot,
  EditorContent,
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
const record = (id: string, range = firstRange) => ({
  thread: commentThread(id),
  range,
});
const setup = (records: Array<ReturnType<typeof record>>) => {
  const initialValue = [
    { children: [{ text: 'Alpha' }], type: 'paragraph' },
    { children: [{ text: 'Beta' }], type: 'paragraph' },
  ];
  const editor = createEditor({
    initialValue,
    plugins: [
      CommentsPlugin.configure({
        initialState: {
          initialComments: commentsFixture(records, initialValue),
          currentUserId: 'alice',
        },
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
  expect(comments.api.attachment('first')).toMatchObject({
    type: 'range',
    status: 'attached',
    range: { anchor: { offset: 2 } },
  });
  expect(
    source.read({
      entry: [editor.read.nodes.get([0, 0])![0], [0, 0]],
    })[0].range
  ).toEqual({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 5 },
  });
  const remount = mock();
  const detach = source.observe!({ refresh: remount });
  editor.update.text.insert('Y', { at: { path: [0, 0], offset: 0 } });
  expect(remount).not.toHaveBeenCalled();
  expect(comments.api.attachment('first')).toMatchObject({
    type: 'range',
    status: 'attached',
    range: { anchor: { offset: 3 } },
  });
  const ranges = source.read({
    entry: [editor.read.nodes.get([0, 0])![0], [0, 0]],
  });
  expect(ranges).toHaveLength(1);
  expect(comments.api.attachment('first')).toEqual({
    type: 'range',
    status: 'attached',
    range: ranges[0].range,
  });
  detach();
});

it('refreshes passive paint membership without observing and records one commit per creation', async () => {
  const { editor, comments, source } = setup([record('first')]);
  const subscribe = editor.subscribeCommit.bind(editor);
  const commits = mock();
  const stopCommits = subscribe(commits);
  const stopped = mock();
  const subscriptions = spyOn(editor, 'subscribeCommit').mockImplementation(
    (listener) => {
      const stop = subscribe(listener);
      return () => {
        stopped();
        stop();
      };
    }
  );
  const value = editor.read.value();
  const readIds = () =>
    source
      .read({ entry: [editor.read.nodes.get([0, 0])![0], [0, 0]] })
      .map(({ attributes }) => attributes['data-comment-id']);
  const create = (id: string) =>
    comments.api.createThread({
      id,
      body: commentBody(),
      target: { type: 'range', range: firstRange },
    });
  expect(readIds()).toEqual(['first']);
  expect(await create('second')).toEqual({
    status: 'applied',
    value: 'second',
  });
  expect(readIds()).toEqual(['first', 'second']);
  expect(await comments.api.removeThread('first')).toEqual({
    status: 'applied',
    value: undefined,
  });
  expect(readIds()).toEqual(['second']);
  expect(comments.api.idsAt(firstRange.anchor)).toEqual(['second']);
  expect(editor.read.value()).toEqual(value);
  expect(commits).toHaveBeenCalledTimes(1);
  expect(subscriptions).not.toHaveBeenCalled();

  const refresh = mock();
  const changed = mock();
  const detach = source.observe!({ refresh });
  const stopAttachments = comments.api.subscribeAttachments(changed);
  expect(subscriptions).toHaveBeenCalledTimes(1);
  detach();
  expect(stopped).not.toHaveBeenCalled();
  stopAttachments();
  expect(stopped).toHaveBeenCalledTimes(1);
  expect(await comments.api.removeThread('second')).toEqual({
    status: 'applied',
    value: undefined,
  });
  expect(readIds()).toEqual([]);
  expect(await create('third')).toEqual({
    status: 'applied',
    value: 'third',
  });
  expect(readIds()).toEqual(['third']);
  expect(comments.api.attachment('third')).toEqual({
    type: 'range',
    status: 'attached',
    range: firstRange,
  });
  expect(comments.api.idsAt(firstRange.anchor)).toEqual(['third']);
  expect(editor.read.value()).toEqual(value);
  expect(commits).toHaveBeenCalledTimes(2);
  expect(subscriptions).toHaveBeenCalledTimes(1);
  expect(refresh).not.toHaveBeenCalled();
  expect(changed).not.toHaveBeenCalled();

  const remounted = mock();
  const detachRemount = source.observe!({ refresh: remounted });
  expect(subscriptions).toHaveBeenCalledTimes(2);
  expect(readIds()).toEqual(['third']);
  expect(await create('fourth')).toEqual({
    status: 'applied',
    value: 'fourth',
  });
  expect(readIds()).toEqual(['third', 'fourth']);
  expect(remounted).toHaveBeenCalledWith({
    nodeKeys: [editor.key([0, 0])],
  });
  detachRemount();
  expect(stopped).toHaveBeenCalledTimes(2);
  expect(readIds()).toEqual(['third', 'fourth']);
  expect(subscriptions).toHaveBeenCalledTimes(2);
  expect(commits).toHaveBeenCalledTimes(3);
  subscriptions.mockRestore();
  stopCommits();
});

it('keeps fully deleted comments reachable and restores their exact paint on undo', () => {
  const { editor, comments, source } = setup([record('first')]);
  editor.update({ history: 'new-batch' }, (tx) =>
    tx.text.delete({ at: { ...firstRange, kind: 'text' } })
  );
  const read = () =>
    source.read({ entry: [editor.read.nodes.get([0, 0])![0], [0, 0]] });
  expect(read()).toEqual([]);
  expect(comments.api.attachment('first')).toEqual({
    type: 'range',
    status: 'unavailable',
  });
  expect(comments.api.getThread('first')).toEqual(commentThread('first'));
  editor.api.history.undo();
  expect(read()).toHaveLength(1);
  expect(read()[0].range).toEqual(firstRange);
  editor.api.history.redo();
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
    return <EditorContent readOnly={readOnly} />;
  }
  const tree = (readOnly = false) => (
    <>
      <EditorRoot editor={editor}>
        <Capture index={0} />
      </EditorRoot>
      <EditorRoot editor={editor} readOnly={readOnly}>
        <Capture index={1} readOnly={readOnly} />
      </EditorRoot>
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

it('keeps five shared conversations attached and painted in independently configured mounted views', async () => {
  const initialValue = [{ type: 'paragraph', children: [{ text: 'Alpha' }] }];
  const ids = ['first', 'second', 'third', 'fourth', 'fifth'];
  const editor = createEditor({
    userId: 'alice',
    initialValue,
    plugins: [
      DefaultAuthoredPlugin,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          initialComments: commentsFixture(
            ids.map((id) => record(id)),
            initialValue
          ),
        },
      }),
    ],
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert('++', { at: { path: [0, 0], offset: 0 } });
  });
  const comments = editor.plugin(CommentsPlugin).api;
  const records = comments.getThreads();
  const semantic = mock();
  const stopSemantic = comments.subscribeThreads(semantic);
  const commits = mock();
  const stopCommits = editor.subscribeCommit(commits);
  const views: Editor[] = [];
  function Capture({ index }: { index: number }) {
    const view = useEditor();
    React.useLayoutEffect(() => {
      views[index] = view;
    }, [index, view]);
    const { api } = view.plugin(CommentsPlugin);
    const position = React.useSyncExternalStore(
      api.subscribeAttachments,
      () => {
        const attachment = api.attachment('first');
        return attachment?.type === 'range' && attachment.status === 'attached'
          ? `${attachment.range.anchor.offset}:${attachment.range.focus.offset}`
          : 'unavailable';
      }
    );
    return (
      <>
        <EditorContent />
        <output data-testid={`position-${index}`}>{position}</output>
      </>
    );
  }
  const mounted = render(
    <>
      <EditorRoot
        editor={editor}
        authored={{ intent: 'edit', projection: 'accepted' }}
        suppressInstanceWarning
      >
        <Capture index={0} />
      </EditorRoot>
      <EditorRoot
        editor={editor}
        authored={{ intent: 'propose', projection: 'markup' }}
        suppressInstanceWarning
      >
        <Capture index={1} />
      </EditorRoot>
    </>
  );
  const first = views[0].plugin(CommentsPlugin).api;
  const second = views[1].plugin(CommentsPlugin).api;
  const source = getPlateDecorationSources(editor).find(
    ({ id }) => id === 'comments'
  )!;
  const readPaint = (view: Editor) =>
    source
      .read({
        editor: view,
        entry: [view.read.nodes.get([0, 0])![0], [0, 0]],
      })
      .map(({ range }) => range);
  const projected = {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 6 },
  };
  expect(mounted.getByTestId('position-0').textContent).toBe('1:4');
  expect(mounted.getByTestId('position-1').textContent).toBe('3:6');
  expect(first.idsAt(firstRange.anchor)).toEqual(ids);
  expect(second.idsAt(firstRange.anchor)).toEqual([]);
  expect(second.idsAt(projected.anchor)).toEqual(ids);
  expect(readPaint(views[0])).toEqual(ids.map(() => firstRange));
  expect(readPaint(views[1])).toEqual(ids.map(() => projected));

  await act(async () => {
    views[0]
      .plugin(DefaultAuthoredPlugin)
      .api.setView({ intent: 'edit', projection: 'markup' });
  });
  expect(mounted.getByTestId('position-0').textContent).toBe('3:6');
  expect(mounted.getByTestId('position-1').textContent).toBe('3:6');
  expect(readPaint(views[0])).toEqual(ids.map(() => projected));
  expect(first.idsAt(projected.anchor)).toEqual(ids);
  await act(async () => {
    views[1]
      .plugin(DefaultAuthoredPlugin)
      .api.setView({ intent: 'edit', projection: 'accepted' });
  });
  expect(mounted.getByTestId('position-1').textContent).toBe('1:4');
  expect(readPaint(views[1])).toEqual(ids.map(() => firstRange));
  expect(first.getSnapshot().visibleThreadIds).toHaveLength(5);
  expect(second.getSnapshot().visibleThreadIds).toHaveLength(5);
  for (const current of records) {
    expect(first.getThread(current.id)).toBe(current);
    expect(second.getThread(current.id)).toBe(current);
  }
  expect(semantic).not.toHaveBeenCalled();
  expect(commits).not.toHaveBeenCalled();
  const changed = mock();
  const refresh = mock();
  const stopAttachments = first.subscribeAttachments(changed);
  const stopPaint = source.observe!({ editor: views[0], refresh });
  mounted.unmount();
  stopAttachments();
  stopPaint();
  views[0]
    .plugin(DefaultAuthoredPlugin)
    .api.setView({ intent: 'edit', projection: 'accepted' });
  await Promise.resolve();
  expect(changed).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();
  expect(first.attachment('first')).toEqual({
    type: 'range',
    status: 'attached',
    range: firstRange,
  });
  expect(first.idsAt(firstRange.anchor)).toEqual(ids);
  stopCommits();
  stopSemantic();
  await Promise.all(ids.map((id) => comments.removeThread(id)));
  expect(first.getThreads()).toEqual([]);
});
