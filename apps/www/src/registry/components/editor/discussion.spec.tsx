import { afterAll, describe, expect, it, mock, spyOn } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BaseBlockquotePlugin,
  BaseItalicPlugin,
  BaseLinkPlugin,
  ElementApi,
  type EditorDocumentValue,
  type Range,
  editorCommands,
} from 'platejs';
import { type AuthoredChange, AuthoredPlugin } from 'platejs/authored';
import type { CommentMutationResult, CommentsJSON } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  EditorContainer,
  EditorContent,
  EditorRoot,
  createEditor,
  definePlugin,
  useCreateEditor,
  useEditor,
} from 'platejs/react';
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionChanges,
  useSuggestionGroups,
} from 'platejs/suggestion/react';
import * as React from 'react';

import {
  CommentKit,
  commentDecorationAttributes,
  createCommentValue,
} from './comment';
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
  it('maps a suggestion’s conversation through a pending prepend without rescanning it for an unrelated edit', async () => {
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
    const comments = model.plugin(CommentsPlugin).api;
    const id = applied(
      await comments.createThread({
        target: { type: 'change', id: changeId },
        body: createCommentValue('Review note'),
      })
    );
    let mountedEditor!: ReturnType<typeof useEditor>;
    function CaptureEditor() {
      mountedEditor = useEditor();
      return null;
    }
    const view = render(
      <EditorRoot editor={model} authored={{ intent: 'edit' }}>
        <CaptureEditor />
        <EditorContainer>
          <EditorContent />
        </EditorContainer>
      </EditorRoot>
    );
    const trigger = () =>
      view
        .getAllByRole('button', {
          name: 'Open 2 discussion items for this block',
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
        mountedEditor.plugin(AuthoredPlugin).read.change(changeId)?.ranges[0]
          .anchor.path[0]
      ).toBe(2)
    );
    expect(trigger().parentElement?.parentElement?.textContent).toBe(
      'Target noted'
    );
    fireEvent.click(trigger());
    expect(view.getByText('Review note')).toBeTruthy();
    expect(
      view.getByRole('textbox', { name: 'Comment on suggestion' })
    ).toBeTruthy();
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
        'Review this carefully'
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
    const inserted = (offset: number) => ({ path: [0, 1], offset });
    act(() =>
      editor.update.text.delete({
        at: { anchor: inserted(1), focus: inserted(2) },
      })
    );
    await waitFor(() => expect(changes[0].revision).not.toBe(revision));
    expect(changes[0].id).toBe(id);
    act(() =>
      editor.update.text.delete({
        at: { anchor: inserted(0), focus: inserted(1) },
      })
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
      plugins: [...SuggestionKit, ...DiscussionKit, CommentsPlugin],
      userId: 'alice',
    });
    function ProjectionControls() {
      const editor = useEditor();

      return (
        <>
          <button
            onClick={() =>
              editor.plugin(AuthoredPlugin).api.setView({ preview: 'accepted' })
            }
            type="button"
          >
            Accepted
          </button>
          <button
            onClick={() =>
              editor.plugin(AuthoredPlugin).api.setView({ intent: 'edit' })
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
      restored.plugin(AuthoredPlugin).read.change(changeId)
    ).not.toBeNull();
    view.unmount();
  });

  const reviewBelowProposal = async (
    afterEditable: () => React.ReactElement | null = () => null
  ) => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = createEditor({
      initialValue: ['alpha', 'beta'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      plugins: [
        ...SuggestionKit,
        ...CommentKit,
        CommentsPlugin.configure({ slots: DiscussionSlots }),
        definePlugin('reviewHost', { slots: { afterEditable } }),
      ],
      userId: 'alice',
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.nodes.insert(
        { type: 'paragraph', children: [{ text: 'proposed' }] },
        { at: [0] }
      );
    });
    let alpha = '';
    editor.update((tx) => {
      alpha = tx.authored.propose();
      tx.text.insert(' noted', { at: { offset: 5, path: [1, 0] } });
    });
    const thread = applied(
      await editor.plugin(CommentsPlugin).api.createThread({
        body: createCommentValue('Alpha note'),
        target: { id: alpha, type: 'change' },
      })
    );

    return { alpha, editor, thread };
  };

  it('shows each block its own card and threads under a preview that hides a proposed paragraph above it', async () => {
    const { alpha, editor } = await reviewBelowProposal();
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Accepted review" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() =>
      expect(
        view
          .getAllByRole('button', { name: /discussion items? for this block/ })
          .map((button) => [
            button.parentElement?.parentElement?.textContent,
            button.getAttribute('aria-label'),
          ])
      ).toEqual([['alpha', 'Open 2 discussion items for this block']])
    );
    fireEvent.click(
      view.getByRole('button', {
        name: 'Open 2 discussion items for this block',
      })
    );
    expect(
      [...view.container.querySelectorAll('[data-suggestion-review]')].map(
        (card) => card.getAttribute('data-suggestion-review')
      )
    ).toEqual([alpha]);
    view.unmount();
  });

  it('wakes a mounted change read when the preview hides a new proposal in its block', async () => {
    const editor = createEditor({
      initialValue: ['alpha', 'beta'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      plugins: SuggestionKit,
      userId: 'alice',
    });
    let changes: readonly AuthoredChange[] = [];
    function ReadChanges() {
      changes = useSuggestionChanges([0]);
      return null;
    }
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
        <EditorContent />
        <ReadChanges />
      </EditorRoot>
    );
    let proposal = '';

    act(() =>
      editor.update((tx) => {
        proposal = tx.authored.propose();
        tx.text.insert(' noted', { at: { offset: 5, path: [0, 0] } });
      })
    );
    await waitFor(() =>
      expect(changes.map(({ id }) => id)).toEqual([proposal])
    );
    view.unmount();
  });

  it('reads a quoted paragraph’s own changes and cards, leaving the pending unwrap to the quote', () => {
    const editor = createEditor({
      initialValue: [
        {
          authored: [
            { at: 1, author: 'alice', change: 'alice:1', kind: 'unwrap' },
          ],
          children: [{ type: 'paragraph', children: [{ text: 'inner' }] }],
          type: 'blockquote',
        },
      ],
      plugins: [BaseBlockquotePlugin, ...SuggestionKit],
      userId: 'alice',
    });
    let read = {};
    function ReadReview() {
      const mounted = useEditor();
      const ids = (items: ReadonlyArray<{ id: string }>) =>
        items.map(({ id }) => id);

      read = {
        innerCards: ids(useSuggestionGroups(mounted.key([0, 0])!)),
        innerChanges: ids(useSuggestionChanges([0, 0])),
        quoteCards: ids(useSuggestionGroups(mounted.key([0])!)),
        quoteChanges: ids(useSuggestionChanges([0])),
      };
      return null;
    }
    const view = render(
      <EditorRoot authored={{ intent: 'edit' }} editor={editor}>
        <EditorContent />
        <ReadReview />
      </EditorRoot>
    );

    expect(read).toEqual({
      innerCards: [],
      innerChanges: [],
      quoteCards: ['alice:1'],
      quoteChanges: ['alice:1'],
    });
    view.unmount();
  });

  it('rereads a mounted change path after a paragraph is prepended above it', async () => {
    const editor = createEditor({
      initialValue: ['alice', 'bob'].map((author) => ({
        type: 'paragraph',
        children: [
          {
            authored: [
              { at: 1, author, change: `${author}:1`, kind: 'insert' },
            ],
            text: author,
          },
        ],
      })),
      plugins: SuggestionKit,
      userId: 'alice',
    });
    let changes: readonly AuthoredChange[] = [];
    function ReadChanges() {
      changes = useSuggestionChanges([1]);
      return null;
    }
    const view = render(
      <EditorRoot authored={{ intent: 'edit' }} editor={editor}>
        <EditorContent />
        <ReadChanges />
      </EditorRoot>
    );

    expect(changes.map(({ id }) => id)).toEqual(['bob:1']);
    act(() =>
      editor.update.nodes.insert(
        { type: 'paragraph', children: [{ text: 'new' }] },
        { at: [0] }
      )
    );
    await waitFor(() =>
      expect(changes.map(({ id }) => id)).toEqual(['alice:1'])
    );
    view.unmount();
  });

  it.each(['suggestion', 'change'] as const)(
    'anchors a %s on alpha’s block under a preview after alpha’s trigger opens it',
    async (route) => {
      let card = '';
      // A preview paints no suggestion to click, so a host list opens the card.
      function OpenCard() {
        const { setActiveId } = useActiveSuggestion();

        return (
          <button onClick={() => setActiveId(card)} type="button">
            Open alpha’s card
          </button>
        );
      }
      const { alpha, editor, thread } = await reviewBelowProposal(OpenCard);

      card = alpha;
      const view = render(
        <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
          <EditorContainer>
            <EditorContent aria-label="Accepted review" />
          </EditorContainer>
        </EditorRoot>
      );

      fireEvent.click(
        await view.findByRole('button', {
          name: 'Open 2 discussion items for this block',
        })
      );
      fireEvent.click(view.getByRole('button', { name: 'Open alpha’s card' }));
      if (route === 'change') {
        act(() => editor.plugin(CommentsPlugin).api.setActive([thread]));
      }
      await waitFor(() => expect(floatingAnchor).not.toBeInstanceOf(Element));
      const alphaBlock = [
        ...view.container.querySelectorAll('[data-editor-node="element"]'),
      ].find((element) => element.textContent === 'alpha')!;
      const alphaRect = new DOMRect(12, 340, 400, 24);
      const measure = spyOn(
        alphaBlock,
        'getBoundingClientRect'
      ).mockReturnValue(alphaRect);

      expect(
        (
          floatingAnchor as { getBoundingClientRect: () => DOMRect }
        ).getBoundingClientRect()
      ).toBe(alphaRect);
      measure.mockRestore();
      view.unmount();
    }
  );

  it.each(['change thread', 'suggestion card'] as const)(
    'keeps an open %s anchored on its text after formatting splits the text before it',
    async (route) => {
      floatingAnchor = null;
      const { DiscussionSlots } = await import(
        `./discussion?test=${Math.random().toString(36).slice(2)}`
      );
      function OpenCard() {
        const { setActiveId } = useActiveSuggestion();

        return (
          <button onClick={() => setActiveId('alice:1')} type="button">
            Open Alice’s card
          </button>
        );
      }
      const editor = createEditor({
        initialValue: [
          { type: 'paragraph', children: [{ text: 'alpha' }] },
          {
            type: 'paragraph',
            children: [
              { text: 'beta' },
              {
                authored: [
                  { at: 1, author: 'alice', change: 'alice:1', kind: 'insert' },
                ],
                text: '!',
              },
            ],
          },
        ],
        plugins: [
          BaseItalicPlugin,
          ...SuggestionKit,
          CommentsPlugin.configure({ slots: DiscussionSlots }),
          definePlugin('reviewHost', { slots: { afterEditable: OpenCard } }),
        ],
        userId: 'bob',
      });
      const thread = applied(
        await editor.plugin(CommentsPlugin).api.createThread({
          body: createCommentValue('Exclamation note'),
          target: { id: 'alice:1', type: 'change' },
        })
      );
      const view = render(
        <EditorRoot authored={{ intent: 'edit' }} editor={editor}>
          <EditorContainer>
            <EditorContent />
          </EditorContainer>
        </EditorRoot>
      );

      if (route === 'suggestion card') {
        fireEvent.click(
          view.getByRole('button', { name: 'Open Alice’s card' })
        );
      } else {
        act(() => editor.plugin(CommentsPlugin).api.setActive([thread]));
      }
      await waitFor(() => expect(floatingAnchor).not.toBeNull());
      act(() =>
        editor.update((tx) => {
          tx.selection.set({
            anchor: { offset: 0, path: [1, 0] },
            focus: { offset: 2, path: [1, 0] },
          });
          tx.command(editorCommands.addMark, { key: 'italic', value: true });
        })
      );
      const anchoredText = () => {
        const measured: string[] = [];
        const { getClientRects } = globalThis.Range.prototype;
        const measure = spyOn(
          globalThis.Range.prototype,
          'getClientRects'
        ).mockImplementation(function recordText(this: globalThis.Range) {
          measured.push(this.toString());
          return getClientRects.call(this);
        });

        (
          floatingAnchor as { getBoundingClientRect: () => DOMRect }
        ).getBoundingClientRect();
        measure.mockRestore();
        return measured;
      };

      expect(anchoredText()).toEqual(['!']);
      view.unmount();
    }
  );

  const triggerOf = (view: ReturnType<typeof render>, text: string) =>
    view
      .queryAllByRole('button', { name: /discussion items? for this block/ })
      .find(
        (button) => button.parentElement?.parentElement?.textContent === text
      );

  // A preview paints no suggestion to click, so a host list opens a thread
  // with its card.
  const reviewList = (
    open: () => Readonly<{ card: string; thread: string }>,
    preview: 'accepted' | 'proposed'
  ) =>
    function ReviewList() {
      const mounted = useEditor();
      const { setActiveId } = useActiveSuggestion();

      return (
        <>
          <button
            onClick={() => {
              const { card, thread } = open();

              setActiveId(card);
              mounted.plugin(CommentsPlugin).api.setActive([thread]);
            }}
            type="button"
          >
            Open alpha’s thread
          </button>
          <button
            onClick={() =>
              mounted.plugin(AuthoredPlugin).api.setView({ preview })
            }
            type="button"
          >
            Switch preview
          </button>
        </>
      );
    };

  it('anchors a thread on the block whose trigger was pressed when its card spans that block and the next', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const editor = createEditor({
      initialValue: ['alpha', 'beta'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      plugins: [
        ...SuggestionKit,
        ...CommentKit,
        CommentsPlugin.configure({ slots: DiscussionSlots }),
      ],
      userId: 'alice',
    });
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.delete({
        at: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 2, path: [1, 0] },
          kind: 'text',
        },
      });
    });
    let insertion = '';
    editor.update((tx) => {
      insertion = tx.authored.propose();
      tx.text.insert('Z', { at: { offset: 0, path: [1, 1] } });
    });
    const thread = applied(
      await editor.plugin(CommentsPlugin).api.createThread({
        body: createCommentValue('Beta note'),
        target: { id: insertion, type: 'change' },
      })
    );
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Accepted review" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => expect(triggerOf(view, 'alpha')).toBeDefined());
    fireEvent.click(triggerOf(view, 'alpha')!);
    act(() => editor.plugin(CommentsPlugin).api.setActive([thread]));
    await waitFor(() => expect(floatingAnchor instanceof Element).toBe(false));
    const alphaBlock = [
      ...view.container.querySelectorAll('[data-editor-node="element"]'),
    ].find((element) => element.textContent === 'alpha')!;
    const measure = spyOn(alphaBlock, 'getBoundingClientRect');

    (
      floatingAnchor as { getBoundingClientRect: () => DOMRect }
    ).getBoundingClientRect();
    expect(measure).toHaveBeenCalled();
    measure.mockRestore();
    view.unmount();
  });

  it('forgets the pressed block when the view changes, so a thread opened from a list after the switch opens no popover', async () => {
    let opened = { card: '', thread: '' };
    const { alpha, editor, thread } = await reviewBelowProposal(
      reviewList(() => opened, 'proposed')
    );

    opened = { card: alpha, thread };
    // Editing and Proposed give alpha one key, so only forgetting keeps the
    // popover off it.
    const view = render(
      <EditorRoot authored={{ intent: 'edit' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Editing review" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => expect(triggerOf(view, 'alpha noted')).toBeDefined());
    fireEvent.click(triggerOf(view, 'alpha noted')!);
    fireEvent.click(view.getByRole('button', { name: 'Switch preview' }));
    await waitFor(() =>
      expect(
        view.container.querySelectorAll('[data-editor-authored-change]').length
      ).toBe(0)
    );
    fireEvent.click(view.getByRole('button', { name: 'Open alpha’s thread' }));
    expect(
      [...view.container.querySelectorAll('[data-suggestion-review]')].map(
        (card) => card.getAttribute('data-suggestion-review')
      )
    ).toEqual([]);
    view.unmount();
  });

  it('opens no popover for a thread opened from a list after the preview hides the block whose trigger was pressed', async () => {
    let opened = { card: '', thread: '' };
    const { alpha, editor, thread } = await reviewBelowProposal(
      reviewList(() => opened, 'accepted')
    );

    opened = { card: alpha, thread };
    const view = render(
      <EditorRoot authored={{ preview: 'proposed' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Proposed review" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => expect(triggerOf(view, 'proposed')).toBeDefined());
    fireEvent.click(triggerOf(view, 'proposed')!);
    fireEvent.click(view.getByRole('button', { name: 'Switch preview' }));
    await waitFor(() => expect(view.queryByText('proposed')).toBeNull());
    fireEvent.click(view.getByRole('button', { name: 'Open alpha’s thread' }));
    expect(
      [...view.container.querySelectorAll('[data-suggestion-review]')].map(
        (card) => card.getAttribute('data-suggestion-review')
      )
    ).toEqual([]);
    view.unmount();
  });

  it('opens no popover on a pressed block that a hidden block above shifts onto the thread’s stored index', async () => {
    let opened = { card: '', thread: '' };
    const { alpha, editor, thread } = await reviewBelowProposal(
      reviewList(() => opened, 'accepted')
    );

    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' too', { at: { offset: 4, path: [2, 0] } });
    });
    opened = { card: alpha, thread };
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Accepted review" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => expect(triggerOf(view, 'beta')).toBeDefined());
    fireEvent.click(triggerOf(view, 'beta')!);
    fireEvent.click(view.getByRole('button', { name: 'Open alpha’s thread' }));
    expect(
      [...view.container.querySelectorAll('[data-suggestion-review]')].map(
        (card) => card.getAttribute('data-suggestion-review')
      )
    ).toEqual([]);
    view.unmount();
  });

  it('redraws the block a proposal the preview hides lands in', async () => {
    const rendered = new Set<number>();
    const RenderCount = definePlugin('renderCount', {
      inject: {
        nodeProps: {
          transformProps: ({ path }) => {
            if (path) rendered.add(path[0]);
            return {};
          },
        },
      },
    });
    const editor = createEditor({
      initialValue: ['alpha', 'beta'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      plugins: [...SuggestionKit, RenderCount],
      userId: 'alice',
    });
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={editor}>
        <EditorContainer>
          <EditorContent aria-label="Accepted redraw" />
        </EditorContainer>
      </EditorRoot>
    );

    await waitFor(() => expect(rendered.has(1)).toBe(true));
    rendered.clear();
    await act(async () => {
      editor.update((tx) => {
        tx.authored.propose();
        tx.text.insert(' noted', { at: { offset: 5, path: [0, 0] } });
      });
    });
    expect([...rendered]).toEqual([0]);
    view.unmount();
  });

  it('keeps a restored whole-block suggestion off every block under the preview and reachable in Editing', async () => {
    const { DiscussionSlots } = await import(
      `./discussion?test=${Math.random().toString(36).slice(2)}`
    );
    const original = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
      plugins: SuggestionKit,
      userId: 'alice',
    });
    let changeId = '';
    original.update((tx) => {
      changeId = tx.authored.propose();
      tx.nodes.insert(
        { type: 'paragraph', children: [{ text: 'proposed' }] },
        { at: [0] }
      );
    });
    const restored = createEditor({
      initialValue: structuredClone(original.read.value()),
      plugins: [
        ...SuggestionKit,
        ...CommentKit,
        CommentsPlugin.configure({ slots: DiscussionSlots }),
      ],
      userId: 'alice',
    });
    function ProjectionControls() {
      const editor = useEditor();

      return (
        <button
          onClick={() =>
            editor.plugin(AuthoredPlugin).api.setView({ intent: 'edit' })
          }
          type="button"
        >
          Editing
        </button>
      );
    }
    const view = render(
      <EditorRoot authored={{ preview: 'accepted' }} editor={restored}>
        <ProjectionControls />
        <EditorContainer>
          <EditorContent aria-label="Restored whole block" />
        </EditorContainer>
      </EditorRoot>
    );
    const triggers = () =>
      view
        .queryAllByRole('button', { name: /discussion items? for this block/ })
        .map((button) => button.parentElement?.parentElement?.textContent);

    await waitFor(() => expect(view.getByText('alpha')).toBeTruthy());
    expect(triggers()).toEqual([]);
    fireEvent.click(view.getByRole('button', { name: 'Editing' }));
    await waitFor(() => expect(triggers()).toEqual(['proposed']));
    fireEvent.click(
      view.getByRole('button', {
        name: 'Open 1 discussion item for this block',
      })
    );
    expect(
      view.container.querySelector(`[data-suggestion-review="${changeId}"]`)
    ).not.toBeNull();
    view.unmount();
  });

  it.each(['accept', 'reject'] as const)(
    'hides a suggestion’s replies once a native %s decides it, and brings them back on undo',
    async (action) => {
      const { DiscussionSlots } = await import(
        `./discussion?test=${Math.random().toString(36).slice(2)}`
      );
      const plugin = CommentsPlugin.configure({
        initialState: {
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
          view.container.querySelector(`[data-comment-thread="${id}"]`)
        ).toBeNull()
      );
      expect(
        view.queryAllByRole('button', { name: /discussion item/ })
      ).toEqual([]);
      expect(comments.getSnapshot()).toBe(snapshot);
      expect(comments.getThread(id)).toBe(record);
      await act(async () => {
        editor.api.history.undo();
      });
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
      expect(
        view.getByRole('button', {
          name: action === 'accept' ? 'Accept suggestion' : 'Reject suggestion',
        })
      ).toBeTruthy();
      expect(
        view.container.querySelector(`[data-comment-thread="${resolvedId}"]`)
      ).toBeNull();
      await act(async () => {
        editor.api.history.redo();
      });
      await waitFor(() =>
        expect(
          view.container.querySelector(`[data-comment-thread="${id}"]`)
        ).toBeNull()
      );
      expect(comments.getSnapshot()).toBe(snapshot);
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
    'Block 200!'
  );
  view.unmount();
});

it('bounds the number of mounted review cards in a busy block', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  // 60 insertions apart from each other, so each is its own card, filling
  // three discussion pages.
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [
      {
        type: 'paragraph',
        children: Array.from({ length: 60 }, (_, index) => [
          { text: ' ' },
          {
            authored: [
              {
                at: index + 1,
                author: 'alice',
                change: `busy:${index}`,
                kind: 'insert',
              },
            ],
            text: String(index % 10),
          },
        ]).flat(),
      },
    ],
  });

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
      name: 'Open 60 discussion items for this block',
    })
  );
  await waitFor(() =>
    expect(
      view.container.querySelectorAll('[data-suggestion-review]')
    ).toHaveLength(20)
  );
  for (const count of [40, 60]) {
    fireEvent.click(
      view.getByRole('button', { name: 'Show more discussion items' })
    );
    await waitFor(() =>
      expect(
        view.container.querySelectorAll('[data-suggestion-review]')
      ).toHaveLength(count)
    );
  }
  expect(
    view.container.querySelector('[data-suggestion-review="busy:59"]')
  ).not.toBeNull();
  view.unmount();
});

it('reads a card’s changes past the first twenty before deciding the card', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  // 21 touching insertions by one author make one card.
  const letters = 'abcdefghijklmnopqrstu';
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'Start ' },
          ...[...letters].map((letter, index) => ({
            authored: [
              {
                at: index + 1,
                author: 'alice',
                change: `run:${index}`,
                kind: 'insert' as const,
              },
            ],
            text: letter,
          })),
          { text: ' end' },
        ],
      },
    ],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Long card" />
      </EditorContainer>
    </EditorRoot>
  );

  await waitFor(() =>
    expect(
      view.container.querySelector('[data-editor-authored-change="run:20"]')
    ).not.toBeNull()
  );
  fireEvent.click(
    view.container.querySelector('[data-editor-authored-change="run:20"]')!
  );
  fireEvent.click(
    await view.findByRole('button', { name: 'Show 1 more changes' })
  );
  expect(view.getByText('Add “u”')).toBeTruthy();
  fireEvent.click(view.getByRole('button', { name: 'Accept suggestion' }));
  await waitFor(() =>
    expect(editor.plugin(AuthoredPlugin).read.changes().items).toEqual([])
  );
  view.unmount();
});

it('decides an open card after it grows in another block', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'One' }] }],
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert(' more', { at: { offset: 3, path: [0, 0] } });
    tx.nodes.insert(
      { type: 'paragraph', children: [{ text: 'Two' }] },
      { at: [1] }
    );
  });
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Growing card" />
      </EditorContainer>
    </EditorRoot>
  );

  const [first] = await view.findAllByRole('button', {
    name: 'Open 1 discussion item for this block',
  });
  fireEvent.click(first);
  await view.findByRole('button', { name: 'Accept suggestion' });
  act(() => {
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert('!', { at: { offset: 3, path: [1, 0] } });
    });
  });
  fireEvent.click(view.getByRole('button', { name: 'Accept suggestion' }));
  await waitFor(() =>
    expect(editor.plugin(AuthoredPlugin).read.changes().items).toEqual([])
  );
  view.unmount();
});

it('counts a thread in the block holding its change and lists it on the card from every block', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'One' }] }],
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert(' more', { at: { offset: 3, path: [0, 0] } });
    tx.nodes.insert(
      { type: 'paragraph', children: [{ text: 'Two' }] },
      { at: [1] }
    );
  });
  let second = '';
  editor.update((tx) => {
    second = tx.authored.propose();
    tx.text.insert('!', { at: { offset: 3, path: [1, 0] } });
  });
  applied(
    await editor.plugin(CommentsPlugin).api.createThread({
      body: createCommentValue('Second note'),
      target: { id: second, type: 'change' },
    })
  );
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Card threads" />
      </EditorContainer>
    </EditorRoot>
  );

  const blockOf = (button: HTMLElement) =>
    button.parentElement?.parentElement?.textContent;
  await waitFor(() =>
    expect(
      view
        .getAllByRole('button', { name: /discussion items? for this block/ })
        .map((button) => [blockOf(button), button.getAttribute('aria-label')])
    ).toEqual([
      ['One more', 'Open 1 discussion item for this block'],
      ['Two!', 'Open 2 discussion items for this block'],
    ])
  );
  fireEvent.click(
    view.getByRole('button', { name: 'Open 1 discussion item for this block' })
  );
  expect(await view.findByText('Second note')).toBeTruthy();
  view.unmount();
});

it('keeps a blocked decision open and applies related changes only after an explicit action', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
    initialState: {
      users: {
        alice: { id: 'alice', name: 'Alice' },
        bob: { id: 'bob', name: 'Bob' },
      },
    },
    decorate: { attributes: commentDecorationAttributes },
    slots: DiscussionSlots,
  });
  const alice = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'alice',
    initialValue: [{ type: 'paragraph', children: [{ text: 'Base' }] }],
  });
  let parent = '';
  alice.update((tx) => {
    parent = tx.authored.propose();
    tx.text.insert(' draft', { at: { path: [0, 0], offset: 4 } });
  });
  const editor = createEditor({
    plugins: [...SuggestionKit, plugin],
    userId: 'bob',
    initialValue: alice.read.value(),
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert('!', { at: { path: [0, 1], offset: 3 } });
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
    expect(editor.plugin(AuthoredPlugin).read.changes().items).toEqual([])
  );
  view.unmount();
});

it('restores independent block triggers from saved ranges and rejects invalid initialization', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const plugin = CommentsPlugin.configure({
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
      plugins: [CommentsPlugin],
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

it('lets an editor without a user comment on and accept a suggestion through its card', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
    ],
    plugins: [
      ...SuggestionKit,
      CommentsPlugin.configure({
        decorate: { attributes: commentDecorationAttributes },
        slots: DiscussionSlots,
      }),
    ],
  });
  let changeId = '';
  editor.update((tx) => {
    changeId = tx.authored.propose();
    tx.text.insert(' carefully', { at: { offset: 11, path: [0, 0] } });
  });
  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContainer>
        <EditorContent aria-label="Suggestions" />
      </EditorContainer>
    </EditorRoot>
  );
  await waitFor(() =>
    expect(
      view.container.querySelector(
        `[data-editor-authored-change="${changeId}"]`
      )
    ).not.toBeNull()
  );
  fireEvent.click(
    view.container.querySelector(`[data-editor-authored-change="${changeId}"]`)!
  );
  const user = userEvent.setup();
  const composer = await view.findByRole('textbox', {
    name: 'Comment on suggestion',
  });

  await user.click(composer);
  await user.keyboard('Looks good');
  fireEvent.submit(composer.closest('form')!);
  await waitFor(() =>
    expect(
      editor
        .plugin(CommentsPlugin)
        .api.getThreads()
        .map(({ target, userId }) => ({ target, userId }))
    ).toEqual([{ target: { id: changeId, type: 'change' }, userId: 'local' }])
  );
  fireEvent.click(view.getByRole('button', { name: 'Accept suggestion' }));

  await waitFor(() =>
    expect(editor.read.text.string([])).toBe('Review this carefully sentence.')
  );
  view.unmount();
});

it('hands the document and comments to the next user through a keyed editor', async () => {
  const { DiscussionSlots } = await import(
    `./discussion?test=${Math.random().toString(36).slice(2)}`
  );
  let mounted!: ReturnType<typeof useEditor>;
  function Handoff() {
    const [userId, setUserId] = React.useState('alice');
    const [snapshot, setSnapshot] = React.useState<{
      comments: CommentsJSON | null;
      document: EditorDocumentValue;
    }>({
      comments: null,
      document: {
        children: [
          { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
        ],
      },
    });
    const editor = useCreateEditor({
      initialValue: snapshot.document,
      plugins: [
        ...SuggestionKit,
        CommentsPlugin.configure({
          decorate: { attributes: commentDecorationAttributes },
          initialState: { initialComments: snapshot.comments },
          slots: DiscussionSlots,
        }),
      ],
      userId,
    });
    mounted = editor;

    return (
      <EditorRoot authored={{ intent: 'edit' }} editor={editor} key={editor.id}>
        <button
          onClick={() => {
            setSnapshot({
              comments: editor.plugin(CommentsPlugin).api.toJSON(),
              document: editor.read.value(),
            });
            setUserId('bob');
          }}
          type="button"
        >
          Switch to Bob
        </button>
        <EditorContainer>
          <EditorContent aria-label="Handoff" />
        </EditorContainer>
      </EditorRoot>
    );
  }
  const view = render(<Handoff />);
  let changeId = '';
  act(() => {
    mounted.update((tx) => {
      changeId = tx.plugin(AuthoredPlugin).propose();
      tx.text.insert(' carefully', { at: { offset: 11, path: [0, 0] } });
    });
  });
  await waitFor(() =>
    expect(
      view.container.querySelector(
        `[data-editor-authored-change="${changeId}"]`
      )
    ).not.toBeNull()
  );
  fireEvent.click(
    view.container.querySelector(`[data-editor-authored-change="${changeId}"]`)!
  );
  const user = userEvent.setup();
  const composer = await view.findByRole('textbox', {
    name: 'Comment on suggestion',
  });

  await user.click(composer);
  await user.keyboard('Ready for Bob');
  fireEvent.submit(composer.closest('form')!);
  await waitFor(() =>
    expect(mounted.plugin(CommentsPlugin).api.getThreads()).toHaveLength(1)
  );
  act(() => {
    mounted.update.text.insert('!', { at: { offset: 0, path: [0, 0] } });
  });
  const alice = mounted;
  fireEvent.click(view.getByRole('button', { name: 'Switch to Bob' }));
  await waitFor(() => expect(mounted).not.toBe(alice));
  act(() => {
    mounted.update((tx) => {
      tx.plugin(AuthoredPlugin).propose();
      tx.text.insert('?', { at: { offset: 0, path: [0, 0] } });
    });
  });

  expect({
    authors: mounted
      .plugin(AuthoredPlugin)
      .read.changes()
      .items.map(({ authorId }) => authorId)
      .sort(),
    text: mounted.read.text.string([]),
    threads: mounted
      .plugin(CommentsPlugin)
      .api.getThreads()
      .map(({ target, userId }) => ({ target, userId })),
    userId: mounted.userId,
  }).toEqual({
    authors: ['alice', 'bob'],
    text: '?!Review this carefully sentence.',
    threads: [{ target: { id: changeId, type: 'change' }, userId: 'alice' }],
    userId: 'bob',
  });
  view.unmount();
});
