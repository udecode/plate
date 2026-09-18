import { afterAll, expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CommentMutationResult } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toolbar } from '@/registry/components/editor/toolbar';

import { createCommentValue } from './comment';
import { AllCommentsButton } from './comment-toolbar-button';

const originalReact = Object.getOwnPropertyDescriptor(globalThis, 'React');

Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
});

afterAll(() => {
  if (originalReact) {
    Object.defineProperty(globalThis, 'React', originalReact);
  } else {
    Reflect.deleteProperty(globalThis, 'React');
  }
});

const applied = <T,>(result: CommentMutationResult<T>): T => {
  if (result.status !== 'applied') throw new Error(`Mutation ${result.status}`);
  return result.value;
};

const createCommentsEditor = () =>
  createEditor({
    plugins: [
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: { alice: { id: 'alice', name: 'Alice' } },
        },
      }),
    ],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Commented text' }] },
    ],
  });

const renderButton = (
  editor: ReturnType<typeof createCommentsEditor>,
  readOnly = false
) =>
  render(
    <EditorRoot editor={editor} readOnly={readOnly}>
      <TooltipProvider>
        <Toolbar>
          <AllCommentsButton />
        </Toolbar>
      </TooltipProvider>
    </EditorRoot>
  );

it('renders nothing when Comments is not installed', () => {
  const editor = createEditor();
  const view = render(
    <EditorRoot editor={editor}>
      <AllCommentsButton />
    </EditorRoot>
  );

  expect(view.queryByRole('button', { name: 'All comments' })).toBeNull();
});

it('discovers open, resolved, and unavailable conversations in a read-only view', async () => {
  const editor = createCommentsEditor();
  const comments = editor.plugin(CommentsPlugin).api;
  const openId = applied(
    await comments.createThread({
      body: createCommentValue('Open conversation'),
      id: 'open',
      target: {
        type: 'range',
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 7 },
        },
      },
    })
  );
  const resolvedId = applied(
    await comments.createThread({
      body: createCommentValue('Resolved conversation'),
      id: 'resolved',
      target: {
        type: 'range',
        range: {
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 12 },
        },
      },
    })
  );
  await comments.resolve(resolvedId);
  act(() => {
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 7 },
          kind: 'text',
        },
      });
    });
  });
  expect(comments.attachment(openId)).toEqual({
    type: 'range',
    status: 'unavailable',
  });
  const selection = editor.read.selection();
  const view = renderButton(editor, true);

  fireEvent.click(view.getByRole('button', { name: 'All comments' }));
  expect(view.getByRole('dialog')).not.toBeNull();
  expect(view.getByText('Open conversation')).not.toBeNull();
  expect(view.getByText('Resolved conversation')).not.toBeNull();
  expect(view.getByText('Target unavailable in this view')).not.toBeNull();
  expect(editor.read.selection()).toEqual(selection);

  fireEvent.click(view.getByRole('button', { name: 'open' }));
  expect(view.getByText('Open conversation')).not.toBeNull();
  expect(view.queryByText('Resolved conversation')).toBeNull();
  fireEvent.click(view.getByRole('button', { name: 'resolved' }));
  expect(view.queryByText('Open conversation')).toBeNull();
  expect(view.getByText('Resolved conversation')).not.toBeNull();

  await act(() => comments.reopen(resolvedId));
  await waitFor(() => {
    expect(view.queryByText('Resolved conversation')).toBeNull();
    expect(view.getByText('No resolved comments')).not.toBeNull();
  });
});

it('mounts one page and keeps dirty replies in place until cancel', async () => {
  const editor = createCommentsEditor();
  const comments = editor.plugin(CommentsPlugin).api;

  for (let index = 0; index < 21; index++) {
    applied(
      await comments.createThread({
        body: createCommentValue(`Conversation ${index}`),
        id: `thread-${index}`,
        target: {
          type: 'range',
          range: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 1 },
          },
        },
      })
    );
  }
  const view = renderButton(editor);
  const user = userEvent.setup();

  await user.click(view.getByRole('button', { name: 'All comments' }));
  expect(view.getAllByRole('article')).toHaveLength(20);
  expect(view.getByText('Page 1 of 2')).not.toBeNull();
  await user.click(view.getByRole('button', { name: 'Next' }));
  expect(view.getAllByRole('article')).toHaveLength(1);
  expect(view.getByText('Conversation 0')).not.toBeNull();

  const reply = view.getByRole('textbox', { name: 'Reply to thread' });
  await user.click(reply);
  await user.keyboard('Keep this draft');
  await waitFor(() => {
    expect(
      (view.getByRole('button', { name: 'Previous' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(view.getByRole('dialog')).not.toBeNull();
  expect(reply.textContent).toContain('Keep this draft');

  await user.click(view.getByRole('button', { name: 'Cancel reply' }));
  await waitFor(() => {
    expect(
      (view.getByRole('button', { name: 'Previous' }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  });
});
