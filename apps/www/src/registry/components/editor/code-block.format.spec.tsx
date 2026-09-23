import { expect, it } from 'bun:test';

import { setEditorReadOnly, type Value } from 'platejs';
import type { CommentMutationResult } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { CodeBlockPlugin, createEditor } from 'platejs/react';

import { formatJsonCodeBlock } from './code-block';

const code = (text: string) => ({
  type: 'codeBlock',
  language: 'json',
  children: [{ text }],
});
const initialValue = (text: string): Value => [code(text)];

const selection = (anchor: number, focus = anchor) => ({
  kind: 'text' as const,
  anchor: { path: [0, 0], offset: anchor },
  focus: { path: [0, 0], offset: focus },
});

const applied = <T,>(result: CommentMutationResult<T>): T => {
  if (result.status !== 'applied') throw new Error(`Mutation ${result.status}`);

  return result.value;
};

it('leaves an already formatted JSON block and its selection untouched', () => {
  const text = '{\n  "a": 1\n}';
  const editor = createEditor({
    plugins: [CodeBlockPlugin],
    initialValue: initialValue(text),
    selection: selection(7),
  });
  setEditorReadOnly(editor, false);
  const block = editor.read.children()[0];
  const textKey = editor.key(block.children[0]);
  const before = editor.read.selection();

  formatJsonCodeBlock(editor, block);

  expect(editor.read.children()).toEqual([code(text)]);
  expect(editor.key(editor.read.children()[0].children[0])).toBe(textKey);
  expect(editor.read.selection()).toEqual(before);
  expect(editor.read.history().undos).toHaveLength(0);
});

it('ignores invalid JSON, read-only views, and stale block references', () => {
  const editor = createEditor({
    plugins: [CodeBlockPlugin],
    initialValue: initialValue('{invalid}'),
  });
  setEditorReadOnly(editor, false);
  const stale = editor.read.children()[0];

  formatJsonCodeBlock(editor, stale);
  expect(editor.read.history().undos).toHaveLength(0);

  editor.update.value.replace({ children: [code('{"a":1}')], selection: null });
  setEditorReadOnly(editor, true);
  formatJsonCodeBlock(editor, editor.read.children()[0]);
  expect(editor.read.children()).toEqual([code('{"a":1}')]);

  setEditorReadOnly(editor, false);
  formatJsonCodeBlock(editor, stale);
  expect(editor.read.children()).toEqual([code('{"a":1}')]);
});

it('formats JSON in one undo step while preserving a backward selection', () => {
  const editor = createEditor({
    plugins: [CodeBlockPlugin],
    initialValue: initialValue('{"a":1}'),
    selection: selection(6, 1),
  });
  setEditorReadOnly(editor, false);
  const block = editor.read.children()[0];

  formatJsonCodeBlock(editor, block);

  expect(editor.read.children()).toEqual([code('{\n  "a": 1\n}')]);
  expect(editor.read.selection()).toEqual({
    anchor: { path: [0, 0], offset: 11 },
    focus: { path: [0, 0], offset: 4 },
  });
  expect(editor.read.history().undos).toHaveLength(1);
  editor.api.history.undo();
  expect(editor.read.children()).toEqual([code('{"a":1}')]);
});

it('keeps a comment on unchanged JSON text attached', async () => {
  const editor = createEditor({
    plugins: [
      CodeBlockPlugin,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: { alice: { id: 'alice', name: 'Alice' } },
        },
      }),
    ],
    initialValue: initialValue('{"a":1}'),
  });
  setEditorReadOnly(editor, false);
  const comments = editor.plugin(CommentsPlugin).api;
  const id = applied(
    await comments.createThread({
      id: 'json-key',
      body: [{ type: 'paragraph', children: [{ text: 'Keep the key' }] }],
      target: {
        type: 'range',
        range: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 3 },
        },
      },
    })
  );

  formatJsonCodeBlock(editor, editor.read.children()[0]);

  expect(comments.attachment(id)).toEqual({
    type: 'range',
    status: 'attached',
    range: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 6 },
    },
  });
  editor.api.history.undo();
  expect(comments.attachment(id)).toEqual({
    type: 'range',
    status: 'attached',
    range: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 3 },
    },
  });
});
