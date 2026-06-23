import {
  createEditorRuntime,
  createEditorView,
  type Descendant,
  type Operation,
} from '@platejs/plite';
import { mergeStringDiffs, normalizeStringDiff, type StringDiff } from '../src';
import { EDITOR_TO_PENDING_DIFFS } from '../src/internal';
import {
  transformPendingPoint,
  transformTextDiff,
} from '../src/utils/diff-text';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

const transformRemoveText = (diff: StringDiff, offset: number, text: string) =>
  transformTextDiff(
    {
      diff,
      id: 1,
      path: [0],
    },
    {
      offset,
      path: [0],
      text,
      type: 'remove_text',
    } satisfies Operation
  )?.diff;

describe('plite-dom diff text', () => {
  test('keeps a leading replacement when the rest is a shared suffix', () => {
    expect(
      normalizeStringDiff('abc', { start: 0, end: 3, text: 'xbc' })
    ).toEqual({ start: 0, end: 1, text: 'x' });
  });

  test('keeps a merged leading replacement when diffs share prefix and suffix text', () => {
    expect(
      mergeStringDiffs(
        'abc',
        { start: 0, end: 3, text: 'ybc' },
        { start: 0, end: 1, text: 'x' }
      )
    ).toEqual({ start: 0, end: 1, text: 'x' });
  });

  test('transforms pending diffs across partial remove_text overlaps', () => {
    const diff = { start: 5, end: 10, text: 'X' };

    expect(transformRemoveText(diff, 2, 'abc')).toEqual({
      start: 2,
      end: 7,
      text: 'X',
    });
    expect(transformRemoveText(diff, 7, 'ab')).toEqual({
      start: 5,
      end: 8,
      text: 'X',
    });
    expect(transformRemoveText(diff, 3, 'abcd')).toEqual({
      start: 3,
      end: 6,
      text: 'X',
    });
    expect(transformRemoveText(diff, 8, 'abcd')).toEqual({
      start: 5,
      end: 8,
      text: 'X',
    });
    expect(transformRemoveText(diff, 3, 'abcdefghi')).toEqual({
      start: 3,
      end: 3,
      text: 'X',
    });
  });

  test('transforms implicit pending points against the view root', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const pendingPoint = { path: [0, 0], offset: 6 };

    expect(
      transformPendingPoint(headerEditor, pendingPoint, {
        offset: 0,
        path: [0, 0],
        root: 'header',
        text: '!',
        type: 'insert_text',
      })
    ).toEqual({ path: [0, 0], offset: 7 });

    expect(
      transformPendingPoint(headerEditor, pendingPoint, {
        offset: 0,
        path: [0, 0],
        root: 'main',
        text: '!',
        type: 'insert_text',
      })
    ).toEqual(pendingPoint);

    EDITOR_TO_PENDING_DIFFS.set(headerEditor, [
      {
        diff: { end: 6, start: 3, text: 'abc' },
        id: 1,
        path: [0, 0],
      },
    ]);

    expect(
      transformPendingPoint(
        headerEditor,
        { path: [0, 0], offset: 4 },
        {
          offset: 0,
          path: [0, 0],
          root: 'header',
          text: '!',
          type: 'insert_text',
        }
      )
    ).toEqual({ path: [0, 0], offset: 5 });
  });

  test('transforms pending text diffs against the view root only', () => {
    const runtime = createEditorRuntime({
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('header'), paragraph('pending')] },
      },
    });
    const headerEditor = createEditorView(runtime, { root: 'header' });
    const textDiff = {
      diff: { end: 2, start: 1, text: 'x' },
      id: 1,
      path: [1, 0],
    };

    expect(
      transformTextDiff(
        textDiff,
        {
          node: paragraph('new main'),
          path: [0],
          root: 'main',
          type: 'insert_node',
        } satisfies Operation,
        headerEditor
      )
    ).toEqual(textDiff);

    expect(
      transformTextDiff(
        textDiff,
        {
          node: paragraph('new header'),
          path: [0],
          root: 'header',
          type: 'insert_node',
        } satisfies Operation,
        headerEditor
      )
    ).toEqual({
      diff: { end: 2, start: 1, text: 'x' },
      id: 1,
      path: [2, 0],
    });
  });
});
