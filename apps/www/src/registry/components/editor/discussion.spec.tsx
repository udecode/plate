import { afterAll, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { Range } from 'platejs';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, createEditor } from 'platejs/react';
import * as React from 'react';

import { suggestionValue } from '@/registry/examples/values/suggestion-value';

import { BasicMarksKit } from './basic-marks';
import { commentDecorationAttributes, createCommentValue } from './comment';
import {
  suggestionPlugin,
  useSuggestionDiscussionReviews,
  type SuggestionDiscussionReview,
} from './suggestion';

let floatingAnchor:
  | Element
  | {
      getBoundingClientRect: () => DOMRect | DOMRectReadOnly;
    }
  | null = null;

mock.module('@/registry/components/editor/floating-popover', () => ({
  FloatingPopover: ({
    children,
    open,
  }: React.PropsWithChildren<{ open?: boolean }>) =>
    open ? <>{children}</> : null,
  FloatingPopoverAnchor: ({ element }: { element: typeof floatingAnchor }) => {
    floatingAnchor = element;

    return null;
  },
  FloatingPopoverContent: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

afterAll(() => {
  mock.restore();
});

describe('DiscussionSlots', () => {
  it.each(['accept', 'reject'] as const)(
    'restores the same rich replies after a direct %s command and history',
    async (action) => {
      const { DiscussionSlots } = await import(
        `./discussion?test=${Math.random().toString(36).slice(2)}`
      );
      const plugin = CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: {
            alice: { id: 'alice', name: 'Alice' },
            bob: { id: 'bob', name: 'Bob' },
            charlie: { id: 'charlie', name: 'Charlie' },
          },
        },
        decorate: { attributes: commentDecorationAttributes },
        slots: DiscussionSlots,
      });
      const editor = createEditor({
        initialValue: suggestionValue,
        plugins: [suggestionPlugin, plugin],
      });
      const comments = editor.plugin(CommentsPlugin).api;
      const id = (await comments.createThread({
        body: [
          {
            children: [{ bold: true, text: 'Original rich reply' }],
            type: 'paragraph',
          },
        ],
        target: { id: 'tighten', type: 'suggestion' },
      }))!;
      const resolvedId = (await comments.createThread({
        body: createCommentValue('Explicitly resolved reply'),
        target: { id: 'tighten', type: 'suggestion' },
      }))!;
      comments.resolve(resolvedId);
      const record = comments.getThread(id);
      const snapshot = comments.getSnapshot();
      let reviews: SuggestionDiscussionReview[] = [];
      function ReadReviews() {
        reviews = useSuggestionDiscussionReviews();
        return null;
      }
      const Root = DiscussionSlots.wrapRoot;
      const Block = DiscussionSlots.wrapNode.component;
      const AfterEditable = DiscussionSlots.afterEditable;
      const view = render(
        <Plate editor={editor}>
          <Root>
            <ReadReviews />
            <Block
              {...({
                children: <div>Suggestions</div>,
                editor,
                element: editor.read.nodes.get([0])![0],
                renderPath: [0],
              } as any)}
            />
            <AfterEditable
              editableRef={{ current: document.createElement('div') }}
            />
          </Root>
        </Plate>
      );
      fireEvent.click(
        await view.findByRole('button', {
          name: 'Open 2 discussion items for this block',
        })
      );
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      const review = reviews.find(
        ({ suggestionId }) => suggestionId === 'tighten'
      )!;
      act(() =>
        editor.plugin(suggestionPlugin).update[action](review.suggestionId)
      );
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"]`)
        ).toBeNull()
      );
      expect(comments.getSnapshot()).toBe(snapshot);
      act(() => editor.update((tx) => tx.history.undo()));
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      expect(comments.getThread(id)).toBe(record);
      expect(
        view.container.querySelector(`[data-comment-thread="${resolvedId}"]`)
      ).toBeNull();
      expect(
        comments
          .getThreads()
          .every(({ target }) => target.type === 'suggestion')
      ).toBe(true);
      act(() => editor.update((tx) => tx.history.redo()));
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"]`)
        ).toBeNull()
      );
      expect(comments.getSnapshot()).toBe(snapshot);
      const restored = structuredClone(suggestionValue);
      act(() =>
        editor.update({ history: 'skip' }).value.replace({ children: restored })
      );
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      expect(comments.getThread(resolvedId)?.resolved).toBe(true);
      view.unmount();
    }
  );

  it('tracks the active collapsed range and falls back to its block trigger', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const commentsPlugin = CommentsPlugin.configure({
      initialState: {
        currentUserId: 'alice',
        users: {
          alice: { id: 'alice', name: 'Alice' },
          bob: { id: 'bob', name: 'Bob' },
          charlie: { id: 'charlie', name: 'Charlie' },
        },
      },
      decorate: { attributes: commentDecorationAttributes },
      slots: DiscussionSlots,
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Alpha' }],
          type: 'paragraph',
        },
      ],
      plugins: [suggestionPlugin, commentsPlugin],
    });
    const comments = editor.plugin(CommentsPlugin).api;
    const range: Range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const id = (await comments.createThread({
      target: { range, type: 'range' },
      body: createCommentValue('First character'),
      id: 'first-character',
    }))!;
    const Root = DiscussionSlots.wrapRoot;
    const Block = DiscussionSlots.wrapNode.component;
    const AfterEditable = DiscussionSlots.afterEditable;
    const editableRef = { current: document.createElement('div') };

    editor.plugin(commentsPlugin).api.setActive([id]);

    const view = render(
      <Plate editor={editor}>
        <Root>
          <Block
            {...({
              children: <div>Alpha</div>,
              editor,
              element: editor.read.nodes.get([0])![0],
              renderPath: [0],
            } as any)}
          />
          <AfterEditable editableRef={editableRef} />
        </Root>
      </Plate>
    );

    const trigger = await view.findByRole('button', {
      name: 'Open 1 discussion item for this block',
    });
    const triggerRect = new DOMRect(480, 120, 30, 24);

    trigger.getBoundingClientRect = () => triggerRect;
    await waitFor(() => expect(floatingAnchor).not.toBeNull());
    const initialFloatingAnchor = floatingAnchor;

    act(() => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.delete({ at: { ...range, kind: 'text' } });
      });
    });

    await waitFor(() => {
      expect(editor.plugin(commentsPlugin).api.range(id)).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
      expect(floatingAnchor).not.toBe(initialFloatingAnchor);
      expect(
        (
          floatingAnchor as {
            getBoundingClientRect: () => DOMRect | DOMRectReadOnly;
          }
        ).getBoundingClientRect()
      ).toEqual(triggerRect);
    });
  });
});

it('moves block triggers with loaded ranges and preserves them when invalid records are rejected', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  let range: Range = {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  };
  const plugin = CommentsPlugin.configure({
    initialState: { currentUserId: 'alice' },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [suggestionPlugin, plugin],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Alpha' }] },
      { type: 'paragraph', children: [{ text: 'Bravo' }] },
    ],
  });
  const comments = editor.plugin(CommentsPlugin).api;
  await comments.createThread({
    id: 'moving',
    target: { type: 'range', range },
    body: createCommentValue('Move me'),
  });
  const Root = DiscussionSlots.wrapRoot;
  const Block = DiscussionSlots.wrapNode.component;
  const view = render(
    <Plate editor={editor}>
      <Root>
        {[0, 1].map((index) => (
          <section data-testid={`block-${index}`} key={index}>
            <Block
              {...({
                children: <div>Block {index}</div>,
                editor,
                element: editor.read.nodes.get([index])![0],
                renderPath: [index],
              } as any)}
            />
          </section>
        ))}
      </Root>
    </Plate>
  );
  expect(view.getByTestId('block-0').querySelector('button')).not.toBeNull();
  expect(view.getByTestId('block-1').querySelector('button')).toBeNull();
  act(() => {
    range = {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [0, 0], offset: 1 },
    };
    comments.setThreads([
      { ...comments.getThread('moving')!, target: { type: 'range', range } },
    ]);
  });
  expect(view.getByTestId('block-0').querySelector('button')).not.toBeNull();
  expect(view.getByTestId('block-1').querySelector('button')).not.toBeNull();
  act(() => {
    range = {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    };
    comments.setThreads([
      { ...comments.getThread('moving')!, target: { type: 'range', range } },
    ]);
  });
  expect(view.getByTestId('block-0').querySelector('button')).toBeNull();
  expect(view.getByTestId('block-1').querySelector('button')).not.toBeNull();
  act(() => {
    expect(() =>
      comments.setThreads([
        comments.getThread('moving')!,
        comments.getThread('moving')!,
      ])
    ).toThrow('Duplicate comment thread ID');
  });
  expect(view.getByTestId('block-1').querySelector('button')).not.toBeNull();
  act(() => {
    range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    comments.setThreads([
      { ...comments.getThread('moving')!, target: { type: 'range', range } },
    ]);
  });
  expect(view.getByTestId('block-0').querySelector('button')).not.toBeNull();
  expect(view.getByTestId('block-1').querySelector('button')).toBeNull();
  view.unmount();
});

it('groups mixed discussions in every covered block without filling gaps in a suggestion', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
        charlie: { id: 'charlie', name: 'Charlie' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [suggestionPlugin, plugin],
    initialValue: [0, 1, 2].map((index) => ({
      type: 'paragraph',
      children: [
        index === 1
          ? { text: 'Unchanged paragraph' }
          : {
              text: `Suggested paragraph ${index}`,
              suggestion: true,
              suggestion_shared: {
                id: 'shared',
                createdAt: 1,
                type: 'insert',
                userId: 'alice',
              },
            },
      ],
    })),
  });
  const comments = editor.plugin(CommentsPlugin).api;
  const range = {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [2, 0], offset: 4 },
  };
  const id = (await comments.createThread({
    body: createCommentValue('Across paragraphs'),
    target: { type: 'range', range },
  }))!;
  const Root = DiscussionSlots.wrapRoot;
  const Block = DiscussionSlots.wrapNode.component;
  const view = render(
    <Plate editor={editor}>
      <Root>
        {[0, 1, 2].map((index) => (
          <section data-testid={`block-${index}`} key={index}>
            <Block
              {...({
                children: <div>Block {index}</div>,
                editor,
                element: editor.read.nodes.get([index])![0],
                renderPath: [index],
              } as any)}
            />
          </section>
        ))}
      </Root>
    </Plate>
  );
  const count = (index: number) =>
    view
      .getByTestId(`block-${index}`)
      .querySelector('[data-count]')
      ?.getAttribute('data-count');

  expect([0, 1, 2].map(count)).toEqual(['2', '1', '2']);
  await act(() => comments.resolve(id));
  expect([0, 1, 2].map(count)).toEqual(['1', undefined, '1']);
  view.unmount();
});

it('describes removed and added formatting together with the affected text', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
        charlie: { id: 'charlie', name: 'Charlie' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...BasicMarksKit, suggestionPlugin, plugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Revised emphasis',
            italic: true,
            suggestion: true,
            suggestion_format: {
              id: 'format',
              createdAt: 1,
              userId: 'alice',
              type: 'update',
              properties: { bold: true },
              newProperties: { italic: true },
            },
          },
        ],
      },
    ],
  });
  const Root = DiscussionSlots.wrapRoot;
  const Block = DiscussionSlots.wrapNode.component;
  const AfterEditable = DiscussionSlots.afterEditable;
  const view = render(
    <Plate editor={editor}>
      <Root>
        <Block
          {...({
            editor,
            element: editor.read.nodes.get([0])![0],
            children: <div>Revised emphasis</div>,
          } as any)}
        />
        <AfterEditable
          editableRef={{ current: document.createElement('div') }}
        />
      </Root>
    </Plate>
  );
  fireEvent.click(
    await view.findByRole('button', {
      name: 'Open 1 discussion item for this block',
    })
  );
  const card = view.container.querySelector(
    '[data-suggestion-review="format"]'
  )!;
  expect(card.textContent).toContain('Remove bold');
  expect(card.textContent).toContain('Add italic');
  expect(card.textContent).toContain('Revised emphasis');
  view.unmount();
});

it('shows the content of a block suggestion before a reviewer accepts its deletion', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
        charlie: { id: 'charlie', name: 'Charlie' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [suggestionPlugin, plugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Retire the obsolete paragraph.' }],
        suggestion: {
          id: 'block',
          type: 'remove',
          userId: 'alice',
          createdAt: 1,
        },
      },
    ],
  });
  const Root = DiscussionSlots.wrapRoot;
  const Block = DiscussionSlots.wrapNode.component;
  const AfterEditable = DiscussionSlots.afterEditable;
  const view = render(
    <Plate editor={editor}>
      <Root>
        <Block
          {...({
            editor,
            element: editor.read.nodes.get([0])![0],
            children: <div>Removed paragraph</div>,
          } as any)}
        />
        <AfterEditable
          editableRef={{ current: document.createElement('div') }}
        />
      </Root>
    </Plate>
  );
  fireEvent.click(
    await view.findByRole('button', {
      name: 'Open 1 discussion item for this block',
    })
  );
  expect(
    view.container.querySelector('[data-suggestion-review="block"]')
      ?.textContent
  ).toContain('Delete: Retire the obsolete paragraph.');
  view.unmount();
});

it('retains rich composer input on rejection and pending persistence, then clears only after success', async () => {
  const { CommentComposer } = await import('./comment');
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
        charlie: { id: 'charlie', name: 'Charlie' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
  });
  const editor = createEditor({ plugins: [plugin] });
  let outcome: boolean | Promise<boolean> = false;
  const submit = mock<React.ComponentProps<typeof CommentComposer>['onSubmit']>(
    () => outcome
  );
  const view = render(
    <Plate editor={editor}>
      <CommentComposer
        ariaLabel="Persisted reply"
        placeholder="Reply"
        onSubmit={submit}
        initialBody={[
          {
            type: 'paragraph',
            children: [{ bold: true, text: 'Keep this draft' }],
          },
        ]}
      />
    </Plate>
  );
  const form = view.container.querySelector('form')!;
  fireEvent.submit(form);
  await view.findByRole('alert');
  expect(
    view.getByRole('textbox', { name: 'Persisted reply' }).textContent
  ).toContain('Keep this draft');
  outcome = Promise.reject(new Error('Network unavailable'));
  fireEvent.submit(form);
  await waitFor(() => expect(form.getAttribute('aria-busy')).toBe('false'));
  expect(view.getByRole('alert').textContent).toContain('Could not save');
  expect(
    view.getByRole('textbox', { name: 'Persisted reply' }).textContent
  ).toContain('Keep this draft');
  let complete!: (saved: boolean) => void;
  outcome = new Promise((resolve) => {
    complete = resolve;
  });
  fireEvent.submit(form);
  expect(form.getAttribute('aria-busy')).toBe('true');
  expect(
    view.getByRole('textbox', { name: 'Persisted reply' }).textContent
  ).toContain('Keep this draft');
  fireEvent.submit(form);
  expect(submit).toHaveBeenCalledTimes(3);
  await act(async () => {
    complete(true);
    await outcome;
  });
  await waitFor(() =>
    expect(
      view.getByRole('textbox', { name: 'Persisted reply' }).textContent
    ).not.toContain('Keep this draft')
  );
  expect(submit.mock.calls[2]?.[0]).toEqual([
    { type: 'paragraph', children: [{ bold: true, text: 'Keep this draft' }] },
  ]);
  view.unmount();
});

it('updates a mounted author profile without publishing thread or anchor changes', async () => {
  const { useCommentUser } = await import('./comment');
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
        charlie: { id: 'charlie', name: 'Charlie' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
  });
  const editor = createEditor({ plugins: [plugin] });
  const comments = editor.plugin(CommentsPlugin).api;
  const anchors = mock();
  const threadIds = mock();
  comments.subscribe(anchors);
  comments.subscribeVisibleThreadIds(threadIds);
  const Profile = () => <span>{useCommentUser('alice')?.name}</span>;
  const view = render(
    <Plate editor={editor}>
      <Profile />
    </Plate>
  );
  expect(view.getByText('Alice')).not.toBeNull();
  act(() =>
    editor.plugin(CommentsPlugin).store.set({
      users: {
        alice: { id: 'alice', name: 'Alicia', avatarUrl: '/alice.png' },
      },
    })
  );
  expect(view.getByText('Alicia')).not.toBeNull();
  expect(anchors).not.toHaveBeenCalled();
  expect(threadIds).not.toHaveBeenCalled();
  view.unmount();
});
