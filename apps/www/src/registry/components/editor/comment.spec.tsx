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
import { CommentsPlugin } from 'platejs/comments/react';
import { createEditor, Plate } from 'platejs/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

import {
  CommentComposer,
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
    <Plate editor={editor}>
      <Inspector />
    </Plate>
  );

  expect(view.container.textContent).toBe('{"drafts":[],"visible":[]}');
  view.unmount();
});

it.each(['empty', 'rejected', 'pending'] as const)(
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
    let complete!: (saved: boolean) => void;
    const pending = new Promise<boolean>((resolve) => {
      complete = resolve;
    });
    const submit = mock<
      React.ComponentProps<typeof CommentComposer>['onSubmit']
    >(() => (outcome === 'pending' ? pending : false));
    const body = [
      {
        type: 'paragraph',
        children: [
          { bold: true, text: outcome === 'empty' ? '' : 'Keep this draft' },
        ],
      },
    ];
    const view = render(
      <Plate editor={editor}>
        <CommentComposer
          ariaLabel="Reply"
          initialBody={body}
          onSubmit={submit}
          placeholder="Reply"
        />
      </Plate>
    );
    const textbox = view.getByRole('textbox', { name: 'Reply' });
    const initialText = textbox.textContent;
    try {
      await act(async () => {
        textbox.focus();
        const selection = document.createRange();
        selection.selectNodeContents(
          textbox.querySelector('[data-plite-node="text"]')!
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
        textbox.querySelectorAll('[data-plite-node="element"]')
      ).toHaveLength(1);
      expect(textbox.textContent).toBe(initialText);
      expect(submit).toHaveBeenCalledTimes(outcome === 'empty' ? 0 : 1);
      if (outcome !== 'empty') expect(submit.mock.calls[0]).toEqual([body]);
      if (outcome === 'rejected') {
        expect(view.getByRole('alert')).not.toBeNull();
      }
      if (outcome === 'pending') {
        expect(textbox.getAttribute('aria-readonly')).toBe('true');
        fireEvent.submit(view.container.querySelector('form')!);
        expect(submit).toHaveBeenCalledTimes(1);
        await act(async () => complete(true));
        expect(textbox.textContent).not.toContain('Keep this draft');
      }
    } finally {
      await act(async () => complete(false));
      view.unmount();
    }
  }
);

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
