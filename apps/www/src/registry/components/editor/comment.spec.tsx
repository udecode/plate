import { afterAll, describe, expect, it, mock } from 'bun:test';

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  CommentMutationDecision,
  CommentMutationResult,
} from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, EditorRoot, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import {
  CommentComposer,
  CommentThreadCard,
  createCommentValue,
  useDraftCommentThreadIds,
  useVisibleCommentThreadIds,
} from './comment';

declare module 'bun:test' {
  interface Matchers<T> extends Pick<
    TestingLibraryMatchers<unknown, T>,
    'toBeVisible' | 'toHaveAttribute'
  > {}
}

const originalOrigin = Object.getOwnPropertyDescriptor(
  window.location,
  'origin'
);
const originalReact = Object.getOwnPropertyDescriptor(globalThis, 'React');

// Bun's classic JSX transform expects React on the copied demo's global scope.
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
  if (originalOrigin) {
    Object.defineProperty(window.location, 'origin', originalOrigin);
  } else {
    Reflect.deleteProperty(window.location, 'origin');
  }
});

it('renders optional comment subscribers without installing comments', () => {
  const editor = createEditor();
  const Inspector = () => {
    const drafts = useDraftCommentThreadIds();
    const visible = useVisibleCommentThreadIds();

    return <output>{JSON.stringify({ drafts, visible })}</output>;
  };
  const view = render(
    <EditorRoot editor={editor}>
      <Inspector />
    </EditorRoot>
  );

  expect(view.container.textContent).toBe('{"drafts":[],"visible":[]}');
  view.unmount();
});

it.each(['empty', 'rejected', 'invalid', 'stale', 'error', 'pending'] as const)(
  'keeps the paragraph intact when Enter submits a comment (%s)',
  async (outcome) => {
    const editor = createEditor({
      plugins: [
        CommentsPlugin.configure({
          initialState: {
            currentUserId: 'alice',
            users: { alice: { id: 'alice', name: 'Alice' } },
          },
        }),
      ],
    });
    let complete!: (saved: CommentMutationResult) => void;
    const pending = new Promise<CommentMutationResult>((resolve) => {
      complete = resolve;
    });
    const submit = mock<
      React.ComponentProps<typeof CommentComposer>['onSubmit']
    >(async () => {
      if (outcome === 'error') throw new Error('Network unavailable');
      if (outcome === 'pending') return pending;
      return { status: outcome === 'empty' ? 'invalid' : outcome };
    });
    const body = [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: outcome === 'empty' ? '' : 'Keep this draft' },
        ],
      },
    ];
    const view = render(
      <EditorRoot editor={editor}>
        <CommentComposer
          ariaLabel="Reply"
          initialBody={body}
          onSubmit={submit}
          placeholder="Reply"
        />
      </EditorRoot>
    );
    const textbox = view.getByRole('textbox', { name: 'Reply' });
    const initialText = textbox.textContent;
    try {
      await act(async () => {
        textbox.focus();
        const selection = document.createRange();
        selection.selectNodeContents(
          textbox.querySelector('[data-editor-node="text"]')!
        );
        selection.collapse(false);
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(selection);
        document.dispatchEvent(new Event('selectionchange'));
      });
      await act(async () => {
        fireEvent.keyDown(textbox, {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
        });
      });
      expect(
        textbox.querySelectorAll('[data-editor-node="element"]')
      ).toHaveLength(1);
      expect(textbox.textContent).toBe(initialText);
      expect(submit).toHaveBeenCalledTimes(outcome === 'empty' ? 0 : 1);
      if (outcome !== 'empty') expect(submit.mock.calls[0]).toEqual([body]);
      if (outcome !== 'empty' && outcome !== 'pending') {
        expect(view.getByRole('alert')).not.toBeNull();
      }
      if (outcome === 'pending') {
        expect(textbox.getAttribute('aria-readonly')).toBe('true');
        fireEvent.submit(view.container.querySelector('form')!);
        expect(submit).toHaveBeenCalledTimes(1);
        await act(async () =>
          complete({ status: 'applied', value: undefined })
        );
        expect(textbox.textContent).not.toContain('Keep this draft');
      }
    } finally {
      await act(async () => complete({ status: 'rejected' }));
      view.unmount();
    }
  }
);

it('awaits resolution and reopening, retains failures, and keeps document undo independent', async () => {
  let finish!: (decision: CommentMutationDecision) => void;
  const editor = createEditor({
    plugins: [
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: { alice: { id: 'alice', name: 'Alice' } },
          mutate: (request) =>
            request.operation === 'resolve' || request.operation === 'reopen'
              ? new Promise((resolve) => {
                  finish = resolve;
                })
              : { status: 'commit', thread: request.proposed },
        },
      }),
    ],
    initialValue: [{ type: 'paragraph', children: [{ text: 'Review this' }] }],
  });
  const comments = editor.plugin(CommentsPlugin).api;
  const created = await comments.createThread({
    body: createCommentValue('Keep this feedback'),
    target: {
      type: 'range',
      range: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      },
    },
  });
  if (created.status !== 'applied') throw new Error('Expected a thread');
  const id = created.value;
  comments.setActive([id]);
  const view = render(
    <EditorRoot editor={editor}>
      <CommentThreadCard id={id} />
    </EditorRoot>
  );
  try {
    const button = view.getByRole('button', { name: 'Resolve thread' });
    fireEvent.click(button);
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(true));
    expect(comments.getThread(id)?.resolution).toBeNull();
    await act(async () => finish({ status: 'reject' }));
    expect(view.getByRole('alert').textContent).toContain('Could not save');
    expect(editor.plugin(CommentsPlugin).store.get('activeIds')).toEqual([id]);
    expect(comments.getThread(id)?.resolution).toBeNull();
    fireEvent.click(button);
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(true));
    await act(async () =>
      finish({
        status: 'commit',
        thread: {
          ...comments.getThread(id)!,
          resolution: {
            userId: 'alice',
            resolvedAt: '2026-09-17T10:00:00.000Z',
          },
        },
      })
    );
    expect(comments.getThread(id)?.resolution?.userId).toBe('alice');
    expect(editor.plugin(CommentsPlugin).store.get('activeIds')).toEqual([]);
    expect(view.queryByRole('textbox', { name: 'Reply to thread' })).toBeNull();
    act(() =>
      editor.update.text.insert('X', { at: { path: [0, 0], offset: 0 } })
    );
    const reopen = view.getByRole('button', { name: 'Reopen thread' });
    fireEvent.click(reopen);
    await waitFor(() => expect(reopen.hasAttribute('disabled')).toBe(true));
    expect(comments.getThread(id)?.resolution).not.toBeNull();
    expect(view.queryByRole('textbox', { name: 'Reply to thread' })).toBeNull();
    await act(async () => finish({ status: 'reject' }));
    expect(view.getByRole('alert').textContent).toContain('Could not save');
    expect(comments.getThread(id)?.resolution).not.toBeNull();
    fireEvent.click(reopen);
    await waitFor(() => expect(reopen.hasAttribute('disabled')).toBe(true));
    await act(async () =>
      finish({
        status: 'commit',
        thread: { ...comments.getThread(id)!, resolution: null },
      })
    );
    expect(comments.getThread(id)?.resolution).toBeNull();
    expect(
      view.getByRole('textbox', { name: 'Reply to thread' })
    ).not.toBeNull();
    act(() => editor.api.history.undo());
    expect(editor.read.text.string([0])).toBe('Review this');
    expect(comments.getThread(id)?.resolution).toBeNull();
    expect(
      view.getByRole('textbox', { name: 'Reply to thread' })
    ).not.toBeNull();
  } finally {
    view.unmount();
  }
});

it('preserves the next active thread and its typed reply when an earlier resolve completes', async () => {
  let finish!: () => void;
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'Review this' }] }],
    plugins: [
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: { alice: { id: 'alice', name: 'Alice' } },
          mutate: (request) =>
            request.operation === 'resolve'
              ? new Promise((resolve) => {
                  finish = () =>
                    resolve({ status: 'commit', thread: request.proposed });
                })
              : { status: 'commit', thread: request.proposed },
        },
      }),
    ],
  });
  const comments = editor.plugin(CommentsPlugin).api;
  for (const id of ['a', 'b']) {
    await comments.createThread({
      id,
      body: createCommentValue(`Thread ${id}`),
      target: {
        type: 'range',
        range: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 6 },
        },
      },
    });
  }
  function ActiveThread() {
    const ids = usePluginStore(CommentsPlugin, 'activeIds');
    return ids.map((id) => <CommentThreadCard id={id} key={id} />);
  }
  comments.setActive(['a']);
  const view = render(
    <EditorRoot editor={editor}>
      <ActiveThread />
    </EditorRoot>
  );
  try {
    fireEvent.click(view.getByRole('button', { name: 'Resolve thread' }));
    await waitFor(() => expect(finish).toBeDefined());
    act(() => comments.setActive(['b']));
    const reply = view.getByRole('textbox', { name: 'Reply to thread' });
    await act(async () => {
      reply.focus();
      const selection = document.createRange();
      selection.selectNodeContents(
        reply.querySelector('[data-editor-node="text"]')!
      );
      selection.collapse(false);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(selection);
      document.dispatchEvent(new Event('selectionchange'));
    });
    act(() => {
      fireEvent(
        reply,
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data: 'Keep my reply to B',
          inputType: 'insertText',
        })
      );
    });
    expect(reply.textContent).toContain('Keep my reply to B');
    await act(async () => finish());
    expect(comments.getThread('a')?.resolution).not.toBeNull();
    expect(editor.plugin(CommentsPlugin).store.get('activeIds')).toEqual(['b']);
    expect(view.getByRole('textbox', { name: 'Reply to thread' })).toBe(reply);
    expect(reply.textContent).toContain('Keep my reply to B');
  } finally {
    view.unmount();
  }
});

describe('existing comment activation (#5126)', () => {
  for (const targetText of ['comments', ' on many text segments']) {
    it(`opens and reopens the discussion from one click on ${JSON.stringify(targetText)}`, async () => {
      Object.defineProperty(window.location, 'origin', {
        configurable: true,
        value: 'http://localhost:3000',
      });
      const { default: DiscussionDemo } =
        await import('../../examples/discussion-demo');
      const view = render(
        <TooltipProvider>
          <DiscussionDemo />
        </TooltipProvider>
      );
      const user = userEvent.setup({ document: globalThis.document });
      const root = view.getByRole('textbox', { name: '' });
      const target = [...root.querySelectorAll('[data-comment-id]')].find(
        (element) => element.textContent === targetText
      );
      const plainText = view.getByText('Discuss changes using', {
        exact: false,
      });
      const events: string[] = [];
      const recordEvent = (event: Event) => {
        if (event.target instanceof Node && root.contains(event.target)) {
          events.push(event.type);
        }
      };

      expect(target).toBeDefined();
      expect(document.activeElement).toBe(document.body);
      expect(root.querySelector('[data-comment-active]')).toBeNull();
      expect(view.queryByRole('dialog')).toBeNull();

      for (const event of ['pointerdown', 'mousedown', 'focus', 'click']) {
        document.addEventListener(event, recordEvent, true);
      }

      try {
        await user.click(target!);

        expect(events).toEqual(['pointerdown', 'mousedown', 'focus', 'click']);
        expect(target).toHaveAttribute('data-comment-active');
        expect(
          within(await view.findByRole('dialog')).getByText(
            'Comments are a great way to provide feedback and discuss changes.'
          )
        ).toBeVisible();

        await user.click(plainText);
        expect(root.querySelector('[data-comment-active]')).toBeNull();
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());

        events.length = 0;
        await user.click(target!);
        expect(events.filter((event) => event !== 'focus')).toEqual([
          'pointerdown',
          'mousedown',
          'click',
        ]);
        if (events.includes('focus')) {
          expect(events.indexOf('focus')).toBe(2);
        }
        expect(target).toHaveAttribute('data-comment-active');
        expect(
          within(await view.findByRole('dialog')).getByText(
            'Comments are a great way to provide feedback and discuss changes.'
          )
        ).toBeVisible();
      } finally {
        for (const event of ['pointerdown', 'mousedown', 'focus', 'click']) {
          document.removeEventListener(event, recordEvent, true);
        }
        view.unmount();
      }
    }, 20_000);
  }
});
