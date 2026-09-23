import { afterAll, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { BaseLinkPlugin, ElementApi, type Range } from 'platejs';
import { type AuthoredChange, DefaultAuthoredPlugin } from 'platejs/authored';
import type { CommentMutationResult } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  EditorContainer,
  EditorContent,
  EditorRoot,
  createEditor,
  useEditor,
} from 'platejs/react';
import {
  SuggestionPlugin,
  useSuggestionChanges,
} from 'platejs/suggestion/react';
import * as React from 'react';

import { commentDecorationAttributes, createCommentValue } from './comment';
import { SuggestionKit } from './suggestion';

const applied = <T,>(result: CommentMutationResult<T>): T => {
  if (result.status !== 'applied') throw new Error(`Mutation ${result.status}`);
  return result.value;
};

let floatingAnchor:
  | Element
  | {
      contextElement?: Element;
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
  it('maps a decided conversation through a pending prepend without rescanning it for an unrelated edit', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    let reads = 0;
    const commentsPlugin = CommentsPlugin.extend({
      api: ({ api }) => ({
        getThreads: () => {
          reads += 1;
          return api.getThreads();
        },
      }),
    }).configure({
      slots: DiscussionSlots,
      initialState: { currentUserId: 'alice' },
    });
    const model = createEditor({
      plugins: [...SuggestionKit, commentsPlugin],
      userId: 'alice',
      initialValue: ['Before', 'Target', 'Unrelated'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
    });
    let changeId = '';
    model.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' noted', { at: { path: [1, 0], offset: 6 } });
    });
    const authored = model.plugin(DefaultAuthoredPlugin);
    authored.update.decide({
      action: 'accept',
      selection: authored.read.select({ ids: [changeId] }),
    });
    const comments = model.plugin(CommentsPlugin).api;
    const id = applied(
      await comments.createThread({
        target: { type: 'change', id: changeId },
        body: createCommentValue('Retained review'),
      })
    );
    let mountedEditor!: ReturnType<typeof useEditor>;
    function CaptureEditor() {
      mountedEditor = useEditor();
      return null;
    }
    const view = render(
      <EditorRoot
        editor={model}
        authored={{ intent: 'edit', projection: 'markup' }}
      >
        <CaptureEditor />
        <EditorContainer>
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
    );
    const trigger = () =>
      view
        .getAllByRole('button', {
          name: 'Open 1 discussion item for this block',
        })
        .find(
          (button) =>
            button.parentElement?.parentElement?.textContent === 'Target noted'
        )!;
    await waitFor(() =>
      expect(trigger().parentElement?.parentElement?.textContent).toBe(
        'Target noted'
      )
    );
    reads = 0;
    act(() =>
      mountedEditor.update.text.insert('!', { at: { path: [2, 0], offset: 9 } })
    );
    expect(reads).toBe(0);
    act(() => {
      mountedEditor.plugin(SuggestionPlugin).api.setMode('suggesting');
      mountedEditor.update.nodes.insert(
        { type: 'paragraph', children: [{ text: 'Pending prepend' }] },
        { at: [0] }
      );
    });
    await waitFor(() =>
      expect(
        mountedEditor.plugin(DefaultAuthoredPlugin).read.change(changeId)
          ?.ranges[0].anchor.path[0]
      ).toBe(2)
    );
    expect(trigger().parentElement?.parentElement?.textContent).toBe(
      'Target noted'
    );
    expect(reads).toBeGreaterThan(0);
    fireEvent.click(trigger());
    expect(view.getByText('Retained review')).toBeTruthy();
    expect(view.getByRole('textbox', { name: 'Reply to thread' })).toBeTruthy();
    expect(comments.getThread(id)?.target).toEqual({
      type: 'change',
      id: changeId,
    });
    view.unmount();
  });

  it('keeps suggestion cards on their live block after a preceding split and merge', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Before' }] },
        { type: 'paragraph', children: [{ text: 'Review this' }] },
      ],
      plugins: [
        ...SuggestionKit,
        CommentsPlugin.configure({ slots: DiscussionSlots }),
      ],
      userId: 'alice',
    });
    let changeId = '';
    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(' carefully', { at: { path: [1, 0], offset: 11 } });
    });
    const view = render(
      <EditorRoot editor={editor}>
        <EditorContainer>
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
    );
    const checkSuggestion = async () => {
      const trigger = await view.findByRole('button', {
        name: 'Open 1 discussion item for this block',
      });
      expect(trigger.parentElement?.parentElement?.textContent).toBe(
        'Review this'
      );
      fireEvent.click(trigger);
      expect(
        view.container.querySelector(`[data-suggestion-review="${changeId}"]`)
      ).not.toBeNull();
      fireEvent.click(
        view.getByRole('button', {
          name: 'Close 1 discussion item for this block',
        })
      );
    };
    await checkSuggestion();
    act(() =>
      editor.update.nodes.split({
        at: { path: [0, 0], offset: 0 },
        always: true,
        match: (node) =>
          ElementApi.isElement(node) && node.type === 'paragraph',
      })
    );
    await checkSuggestion();
    act(() => editor.update.nodes.merge({ at: [1] }));
    await checkSuggestion();
    view.unmount();
  });

  it('groups only contiguous inserted text across an inline boundary', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const plugin = CommentsPlugin.configure({
      initialState: {
        currentUserId: 'alice',
        users: { alice: { id: 'alice', name: 'Alice' } },
      },
      decorate: { attributes: commentDecorationAttributes },
      slots: DiscussionSlots,
    });
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Use ' },
            {
              type: 'link',
              url: '/docs/suggestion',
              children: [{ text: '' }],
            },
            { text: '' },
          ],
        },
        { type: 'paragraph', children: [{ text: ' ' }] },
      ],
      plugins: [BaseLinkPlugin, ...SuggestionKit, plugin],
      userId: 'alice',
    });
    let changeId = '';

    editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert('suggestions', {
        at: { offset: 0, path: [0, 1, 0] },
      });
      tx.text.insert(' like this added text', {
        at: { offset: 0, path: [0, 2] },
      });
    });
    let separatedChangeId = '';
    editor.update((tx) => {
      separatedChangeId = tx.authored.propose();
      tx.text.insert('first', { at: { offset: 0, path: [1, 0] } });
      tx.text.insert('second', { at: { offset: 6, path: [1, 0] } });
    });
    const view = render(
      <EditorRoot editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Contiguous suggestion" />
        </EditorContainer>
      </EditorRoot>
    );

    const triggers = await view.findAllByRole('button', {
      name: 'Open 1 discussion item for this block',
    });

    expect(triggers).toHaveLength(2);
    fireEvent.click(triggers[0]);
    const card = view.container.querySelector(
      `[data-suggestion-review="${changeId}"]`
    );
    const descriptions = [...(card?.querySelectorAll('p') ?? [])].map(
      (item) => item.textContent
    );

    expect(descriptions).toEqual(['Add “suggestions like this added text”']);

    fireEvent.click(triggers[1]);
    const separatedCard = view.container.querySelector(
      `[data-suggestion-review="${separatedChangeId}"]`
    );
    const separatedDescriptions = [
      ...(separatedCard?.querySelectorAll('p') ?? []),
    ].map((item) => item.textContent);

    expect(separatedDescriptions).toEqual(['Add “first”', 'Add “second”']);
    view.unmount();
  });

  it('publishes suggestion additions, amendments and cancellation to the mounted change query', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'ABC' }] }],
      plugins: SuggestionKit,
      userId: 'alice',
    });
    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    let changes: readonly AuthoredChange[] = [];
    let renders = 0;
    function ReadChanges() {
      changes = useSuggestionChanges([0]);
      renders += 1;
      return null;
    }
    const mounted = render(
      <EditorRoot editor={editor}>
        <ReadChanges />
      </EditorRoot>
    );
    const point = (offset: number) => ({ path: [0, 0], offset });
    expect(changes).toHaveLength(0);
    act(() => editor.update.text.insert('pq', { at: point(1) }));
    await waitFor(() => expect(changes).toHaveLength(1));
    const { id, revision } = changes[0];
    act(() =>
      editor.update.text.delete({ at: { anchor: point(2), focus: point(3) } })
    );
    await waitFor(() => expect(changes[0].revision).toBeGreaterThan(revision));
    expect(changes[0].id).toBe(id);
    act(() =>
      editor.update.text.delete({ at: { anchor: point(1), focus: point(2) } })
    );
    await waitFor(() => expect(changes).toHaveLength(0));
    mounted.unmount();
    const settledRenders = renders;
    act(() => editor.update.text.insert('z', { at: point(1) }));
    expect(renders).toBe(settledRenders);
    expect(changes).toHaveLength(0);
  });

  it('keeps restored suggestions reachable when switching document projections', async () => {
    const { DiscussionKit } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const original = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Review this sentence.' }] },
        { type: 'paragraph', children: [{ text: 'An unchanged paragraph.' }] },
      ],
      plugins: SuggestionKit,
      userId: 'alice',
    });
    let changeId = '';
    original.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert('carefully ', { at: { offset: 7, path: [0, 0] } });
    });
    const restored = createEditor({
      initialValue: structuredClone(original.read.value()),
      plugins: [
        ...SuggestionKit,
        ...DiscussionKit,
        CommentsPlugin.configure({
          initialState: { currentUserId: 'alice' },
        }),
      ],
      userId: 'alice',
    });
    function ProjectionControls() {
      const editor = useEditor();

      return (
        <>
          <button
            onClick={() =>
              editor
                .plugin(DefaultAuthoredPlugin)
                .api.setView({ intent: 'edit', projection: 'accepted' })
            }
            type="button"
          >
            Accepted
          </button>
          <button
            onClick={() =>
              editor
                .plugin(DefaultAuthoredPlugin)
                .api.setView({ intent: 'edit', projection: 'markup' })
            }
            type="button"
          >
            Markup
          </button>
        </>
      );
    }
    const view = render(
      <EditorRoot editor={restored}>
        <ProjectionControls />
        <EditorContainer>
          <EditorContent aria-label="Restored suggestions" />
        </EditorContainer>
      </EditorRoot>
    );

    for (const projection of ['Markup', 'Accepted', 'Markup']) {
      fireEvent.click(view.getByRole('button', { name: projection }));
      await waitFor(() => {
        const triggers = view.getAllByRole('button', {
          name: 'Open 1 discussion item for this block',
        });
        expect(triggers).toHaveLength(1);
        expect(triggers[0].parentElement?.parentElement?.textContent).toBe(
          projection === 'Accepted'
            ? 'Review this sentence.'
            : 'Review carefully this sentence.'
        );
      });
    }

    fireEvent.click(
      view.getByRole('button', {
        name: 'Open 1 discussion item for this block',
      })
    );
    expect(
      view.container.querySelector(`[data-suggestion-review="${changeId}"]`)
    ).not.toBeNull();
    expect(
      view.getByRole('button', { name: 'Accept suggestion' })
    ).toBeTruthy();
    expect(
      restored.plugin(DefaultAuthoredPlugin).read.change(changeId)?.status
    ).toBe('pending');
    view.unmount();
  });

  it.each(['accept', 'reject'] as const)(
    'preserves the same rich replies across a native %s decision and history',
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
        initialValue: [
          { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
        ],
        plugins: [...SuggestionKit, plugin],
        userId: 'alice',
      });
      let changeId = '';
      editor.update((tx) => {
        changeId = tx.authored.propose();
        tx.text.insert(' carefully', { at: { offset: 11, path: [0, 0] } });
      });
      const comments = editor.plugin(CommentsPlugin).api;
      const id = applied(
        await comments.createThread({
          body: [
            {
              children: [{ bold: true, text: 'Original rich reply' }],
              type: 'paragraph',
            },
          ],
          target: { id: changeId, type: 'change' },
        })
      );
      const resolvedId = applied(
        await comments.createThread({
          body: createCommentValue('Explicitly resolved reply'),
          target: { id: changeId, type: 'change' },
        })
      );
      await comments.resolve(resolvedId);
      const record = comments.getThread(id);
      const snapshot = comments.getSnapshot();
      let changes: readonly AuthoredChange[] = [];
      function ReadChanges() {
        changes = useSuggestionChanges([0]);
        return null;
      }
      function SuggestionModeControl() {
        const mountedEditor = useEditor();

        return (
          <button
            onClick={() =>
              mountedEditor.plugin(SuggestionPlugin).api.setMode('suggesting')
            }
            type="button"
          >
            Suggestion mode
          </button>
        );
      }
      const view = render(
        <EditorRoot editor={editor}>
          <SuggestionModeControl />
          <ReadChanges />
          <EditorContainer>
            <EditorContent aria-label="Suggestions" />
          </EditorContainer>
        </EditorRoot>
      );
      fireEvent.click(view.getByRole('button', { name: 'Suggestion mode' }));
      await waitFor(() =>
        expect(
          view.container.querySelector(
            `[data-editor-authored-change="${changeId}"]`
          )
        ).not.toBeNull()
      );
      fireEvent.click(
        view.container.querySelector(
          `[data-editor-authored-change="${changeId}"]`
        )!
      );
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      expect(changes.some(({ id: currentId }) => currentId === changeId)).toBe(
        true
      );
      fireEvent.click(
        view.getByRole('button', {
          name: action === 'accept' ? 'Accept suggestion' : 'Reject suggestion',
        })
      );
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      expect(comments.getSnapshot()).toBe(snapshot);
      fireEvent.click(
        await view.findByRole('button', {
          name: 'Open 1 discussion item for this block',
        })
      );
      expect(
        view.container.querySelector(`[data-comment-thread="${id}"] strong`)
          ?.textContent
      ).toBe('Original rich reply');
      expect(
        view.queryByRole('button', { name: 'Accept suggestion' })
      ).toBeNull();
      expect(comments.getThread(id)).toBe(record);
      fireEvent.click(
        view.getByRole('button', {
          name: 'Close 1 discussion item for this block',
        })
      );
      await act(() => editor.api.history.undo());
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
      expect(comments.getThread(id)).toBe(record);
      expect(
        view.container.querySelector(`[data-comment-thread="${resolvedId}"]`)
      ).toBeNull();
      expect(
        comments.getThreads().every(({ target }) => target.type === 'change')
      ).toBe(true);
      await act(() => editor.api.history.redo());
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"] strong`)
            ?.textContent
        ).toBe('Original rich reply')
      );
      expect(comments.getSnapshot()).toBe(snapshot);
      expect(
        view.container.querySelector(`[data-comment-thread="${id}"] strong`)
          ?.textContent
      ).toBe('Original rich reply');
      expect(comments.getThread(resolvedId)?.resolution).not.toBeNull();
      expect(comments.getThread(id)).toBe(record);
      view.unmount();
    }
  );

  it('removes live placement when an active range loses all content', async () => {
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
      plugins: [commentsPlugin],
    });
    const comments = editor.plugin(CommentsPlugin).api;
    const range: Range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const id = applied(
      await comments.createThread({
        target: { range, type: 'range' },
        body: createCommentValue('First character'),
        id: 'first-character',
      })
    );
    editor.plugin(commentsPlugin).api.setActive([id]);

    const view = render(
      <EditorRoot editor={editor}>
        <EditorContainer>
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
    );

    await view.findByRole('button', {
      name: 'Open 1 discussion item for this block',
    });
    await waitFor(() => expect(floatingAnchor).not.toBeNull());

    act(() => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.delete({ at: { ...range, kind: 'text' } });
      });
    });

    await waitFor(() => {
      expect(editor.plugin(commentsPlugin).api.attachment(id)).toEqual({
        type: 'range',
        status: 'unavailable',
      });
      expect(
        view.queryByRole('button', {
          name: 'Open 1 discussion item for this block',
        })
      ).toBeNull();
      expect(view.queryByText('First character')).toBeNull();
    });
  });

  it('binds a virtual anchor to the editor root registered after render', async () => {
    floatingAnchor = null;
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const commentsPlugin = CommentsPlugin.configure({
      initialState: {
        currentUserId: 'alice',
        users: { alice: { id: 'alice', name: 'Alice' } },
      },
      decorate: { attributes: commentDecorationAttributes },
      slots: DiscussionSlots,
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'Anchor lifecycle' }],
          type: 'paragraph',
        },
      ],
      plugins: [commentsPlugin],
    });
    const id = applied(
      await editor.plugin(commentsPlugin).api.createThread({
        body: createCommentValue('Mounted comment'),
        id: 'mounted-comment',
        target: {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 6, path: [0, 0] },
          },
          type: 'range',
        },
      })
    );

    editor.plugin(commentsPlugin).api.setActive([id]);
    const view = render(
      <EditorRoot editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Anchor lifecycle editor" />
        </EditorContainer>
      </EditorRoot>
    );
    const root = await view.findByLabelText('Anchor lifecycle editor');

    await waitFor(() => {
      expect(floatingAnchor).not.toBeNull();
      expect(
        (
          floatingAnchor as {
            contextElement?: Element;
          }
        ).contextElement
      ).toBe(root);
    });
    view.unmount();
  });
});

it('discovers a suggestion after the first 200 without materializing a global card feed', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: { currentUserId: 'alice' },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: Array.from({ length: 201 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `Block ${index}` }],
    })),
  });

  for (let index = 0; index < 201; index++) {
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert('!', {
        at: { path: [index, 0], offset: `Block ${index}`.length },
      });
    });
  }

  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent />
      </EditorContainer>
    </EditorRoot>
  );

  const triggers = await view.findAllByRole('button', {
    name: 'Open 1 discussion item for this block',
  });
  expect(triggers).toHaveLength(201);
  expect(triggers[200].parentElement?.parentElement?.textContent).toBe(
    'Block 200'
  );
  view.unmount();
});

it('bounds the number of mounted review cards in a busy block', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: { currentUserId: 'alice' },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
  });

  for (let index = 0; index < 25; index++) {
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(String(index % 10), {
        at: { path: [0, 0], offset: 4 + index },
      });
    });
  }

  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Busy suggestions" />
      </EditorContainer>
    </EditorRoot>
  );

  fireEvent.click(
    await view.findByRole('button', {
      name: 'Open 25 discussion items for this block',
    })
  );
  await waitFor(() =>
    expect(
      view.container.querySelectorAll('[data-suggestion-review]')
    ).toHaveLength(20)
  );
  fireEvent.click(
    view.getByRole('button', { name: 'Show more discussion items' })
  );
  await waitFor(() =>
    expect(
      view.container.querySelectorAll('[data-suggestion-review]')
    ).toHaveLength(25)
  );
  view.unmount();
});

it('keeps a blocked decision open and applies related changes only after an explicit action', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: {
      currentUserId: 'alice',
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
  });
  let parent = '';
  editor.update((tx) => {
    parent = tx.authored.propose();
    tx.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
  });
  editor.runtime.userId = 'bob';
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert('!', { at: { path: [0, 0], offset: 7 } });
  });

  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Blocked suggestions" />
      </EditorContainer>
    </EditorRoot>
  );

  await waitFor(() =>
    expect(
      view.container.querySelector(`[data-editor-authored-change="${parent}"]`)
    ).not.toBeNull()
  );
  fireEvent.click(
    view.container.querySelector(`[data-editor-authored-change="${parent}"]`)!
  );
  fireEvent.click(
    await view.findByRole('button', { name: 'Reject suggestion' })
  );
  const alert = await view.findByRole('alert');
  expect(alert.textContent).toContain(
    'This decision also affects 1 related suggestion.'
  );
  fireEvent.click(view.getByRole('button', { name: 'Reject related' }));
  await waitFor(() =>
    expect(
      editor.plugin(DefaultAuthoredPlugin).read.changes({ status: 'pending' })
        .items
    ).toEqual([])
  );
  view.unmount();
});

it('restores independent block triggers from saved ranges and rejects invalid initialization', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: { currentUserId: 'alice' },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const source = createEditor({
    plugins: [plugin],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Alpha' }] },
      { type: 'paragraph', children: [{ text: 'Bravo' }] },
    ],
  });
  const comments = source.plugin(CommentsPlugin).api;
  applied(
    await comments.createThread({
      id: 'moving',
      target: {
        type: 'range',
        range: {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 1 },
        },
      },
      body: createCommentValue('Move me'),
    })
  );
  const snapshot = JSON.parse(
    JSON.stringify({
      document: source.read.value(),
      comments: comments.toJSON(),
    })
  );
  const editor = createEditor({
    plugins: [
      plugin,
      CommentsPlugin.configure({
        initialState: { initialComments: snapshot.comments },
      }),
    ],
    initialValue: snapshot.document,
  });
  const assembly = () => (
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent />
      </EditorContainer>
    </EditorRoot>
  );
  const view = render(assembly());
  const block = (index: number) =>
    view.container.querySelector('[data-editor="true"]')!.children[index];
  expect(block(0).querySelector('button')).not.toBeNull();
  expect(block(1).querySelector('button')).toBeNull();
  act(() => source.update.nodes.move({ at: [0], to: [1] }));
  expect(block(0).querySelector('button')).not.toBeNull();
  expect(block(1).querySelector('button')).toBeNull();
  expect(() =>
    createEditor({
      plugins: [
        plugin,
        CommentsPlugin.configure({
          initialState: {
            initialComments: {
              ...snapshot.comments,
              threads: [
                ...snapshot.comments.threads,
                snapshot.comments.threads[0],
              ],
            },
          },
        }),
      ],
      initialValue: snapshot.document,
    })
  ).toThrow('Duplicate comment thread ID');
  expect(block(0).querySelector('button')).not.toBeNull();
  act(() => editor.update.nodes.move({ at: [0], to: [1] }));
  view.rerender(assembly());
  expect(block(0).querySelector('button')).toBeNull();
  expect(block(1).querySelector('button')).not.toBeNull();
  view.unmount();
});

it.each(['range', 'change'] as const)(
  'does not place a restored %s conversation when this revision has no target',
  async (targetType) => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const source = createEditor({
      plugins: [
        CommentsPlugin.configure({ initialState: { currentUserId: 'alice' } }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'Original' }] }],
    });
    const comments = source.plugin(CommentsPlugin).api;
    const id = applied(
      await comments.createThread({
        body: createCommentValue('Retained conversation'),
        target:
          targetType === 'change'
            ? { type: 'change', id: 'historical-change' }
            : {
                type: 'range',
                range: {
                  anchor: { path: [0, 0], offset: 0 },
                  focus: { path: [0, 0], offset: 8 },
                },
              },
      })
    );
    const saved = comments.toJSON();
    const editor = createEditor({
      plugins: [
        CommentsPlugin.configure({
          initialState: {
            currentUserId: 'alice',
            initialComments: {
              ...saved,
              ranges:
                targetType === 'range' ? [{ threadId: id, range: null }] : [],
            },
          },
          slots: DiscussionSlots,
        }),
      ],
      initialValue: source.read.value(),
    });
    const Root = DiscussionSlots.wrapRoot;
    const AfterEditable = DiscussionSlots.afterEditable;
    const view = render(
      <EditorRoot editor={editor}>
        <Root>
          <AfterEditable editableRef={{ current: null }} />
        </Root>
      </EditorRoot>
    );
    try {
      expect(view.queryByText('Retained conversation')).toBeNull();
      expect(view.queryByText('Comment target unavailable')).toBeNull();
      expect(
        view.queryByRole('textbox', { name: 'Reply to thread' })
      ).toBeNull();
      expect(editor.plugin(CommentsPlugin).api.getThread(id)?.target).toEqual(
        targetType === 'change'
          ? { type: 'change', id: 'historical-change' }
          : { type: 'range' }
      );
      await act(async () => {
        await editor.plugin(CommentsPlugin).api.resolve(id);
      });
      expect(
        editor.plugin(CommentsPlugin).api.getThread(id)?.resolution
      ).not.toBeNull();
    } finally {
      view.unmount();
    }
  }
);

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
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [0, 1, 2].map((index) => ({
      type: 'paragraph',
      children: [{ text: index === 1 ? 'Unchanged paragraph' : 'Base' }],
    })),
  });
  let sharedId = '';
  editor.update((tx) => {
    sharedId = tx.authored.propose();
    tx.text.insert(' suggested 0', { at: { offset: 4, path: [0, 0] } });
  });
  editor.update((tx) => {
    tx.authored.propose({ changeId: sharedId });
    tx.text.insert(' suggested 2', { at: { offset: 4, path: [2, 0] } });
  });
  const comments = editor.plugin(CommentsPlugin).api;
  const range = {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [2, 0], offset: 4 },
  };
  const id = applied(
    await comments.createThread({
      body: createCommentValue('Across paragraphs'),
      target: { type: 'range', range },
    })
  );
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent />
      </EditorContainer>
    </EditorRoot>
  );
  const count = (index: number) =>
    view.container
      .querySelector('[data-editor="true"]')!
      .children[index].querySelector('[data-count]')
      ?.getAttribute('data-count');

  expect([0, 1, 2].map(count)).toEqual(['2', '1', '2']);
  await act(() => comments.resolve(id));
  expect([0, 1, 2].map(count)).toEqual(['1', undefined, '1']);
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
  let outcome: Promise<CommentMutationResult> = Promise.resolve({
    status: 'rejected',
  });
  const submit = mock<React.ComponentProps<typeof CommentComposer>['onSubmit']>(
    () => outcome
  );
  const view = render(
    <EditorRoot editor={editor}>
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
    </EditorRoot>
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
  let complete!: (saved: CommentMutationResult) => void;
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
    complete({ status: 'applied', value: undefined });
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
  comments.subscribeAttachments(anchors);
  comments.subscribeVisibleThreadIds(threadIds);
  const Profile = () => <span>{useCommentUser('alice')?.name}</span>;
  const view = render(
    <EditorRoot editor={editor}>
      <Profile />
    </EditorRoot>
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
