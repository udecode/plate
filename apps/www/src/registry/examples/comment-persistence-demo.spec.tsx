import { afterAll, expect, it } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import { BaseHeadingPlugin, BaseLinkPlugin, createEditor } from 'platejs';
import { BaseCommentsPlugin } from 'platejs/comments';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import CommentPersistenceDemo from './comment-persistence-demo';
import { commentValue, createCommentSnapshot } from './values/comment-value';

const originalReact = Object.getOwnPropertyDescriptor(globalThis, 'React');
Object.defineProperty(globalThis, 'React', {
  configurable: true,
  value: React,
});
afterAll(() => {
  if (originalReact) Object.defineProperty(globalThis, 'React', originalReact);
  else Reflect.deleteProperty(globalThis, 'React');
});

it.each([{ value: commentValue }, { value: commentValue.slice(0, 2) }])(
  'restores the fixture against its exact saved document with fresh history',
  ({ value }) => {
    const saved = JSON.parse(JSON.stringify(createCommentSnapshot(value)));
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseLinkPlugin,
        BaseCommentsPlugin.configure({
          initialState: { initialComments: saved.comments },
        }),
      ],
      initialValue: saved.document,
    });
    const comments = editor.plugin(BaseCommentsPlugin).api;
    for (const thread of comments.getThreads()) {
      const attachment = comments.attachment(thread.id);
      if (attachment?.type !== 'range' || attachment.status !== 'attached') {
        throw new Error('Expected a restored fixture range');
      }
      expect(editor.read.text.string(attachment.range)).toBe(thread.excerpt);
    }
    expect(comments.toJSON()).toEqual(saved.comments);
    editor.api.history.undo();
    expect(editor.read.value()).toEqual(saved.document);
  }
);

it('opens a saved historical preview and reloads the paired snapshot', () => {
  const view = render(
    <TooltipProvider>
      <CommentPersistenceDemo />
    </TooltipProvider>
  );
  try {
    fireEvent.click(view.getByRole('button', { name: 'Save snapshot' }));
    fireEvent.click(
      view.getByRole('button', {
        name: 'Preview saved version with current comments',
      })
    );
    const preview = view.getByRole('textbox', {
      name: 'Historical comments document',
    });
    expect(preview.getAttribute('aria-readonly')).toBe('true');
    expect(
      preview.querySelectorAll('[data-comment-id]').length
    ).toBeGreaterThan(0);
    const historicalAllCommentsButton = view
      .getAllByRole('button', { name: 'All comments' })
      .at(-1);

    if (!historicalAllCommentsButton) {
      throw new Error('Expected historical comments discovery control.');
    }
    fireEvent.click(historicalAllCommentsButton);
    expect(
      view.getByText(
        'Comments are a great way to provide feedback and discuss changes.'
      )
    ).not.toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'Close' }));
    fireEvent.click(view.getByRole('button', { name: 'Reload snapshot' }));
    expect(
      view.queryByRole('textbox', { name: 'Historical comments document' })
    ).toBeNull();
    expect(
      view
        .getByRole('textbox', { name: 'Saved comments document' })
        .querySelectorAll('[data-comment-id]').length
    ).toBeGreaterThan(0);
  } finally {
    view.unmount();
  }
});
