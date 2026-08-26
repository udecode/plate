/** @jsx jsxt */

import {
  type BaseEditor,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import {
  ContentSlice,
  type Descendant,
  editorCommands,
  property,
  schema,
} from '@platejs/plite';
import { jsxt, projectTestSelectionRange } from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

import {
  BaseSuggestionPlugin,
  SUGGESTION_TRANSIENT_KEY,
} from './BaseSuggestionPlugin';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  initialState: {
    currentUserId: 'testId',
  },
});

const MentionPlugin = defineBasePlugin(PLUGINS.mention, {
  schema: {
    element: {
      properties: {
        label: property.string(),
        ref: property.string({ required: true }),
      },
      void: 'markable-inline',
    },
  },
});

const DatePlugin = defineBasePlugin(PLUGINS.date, {
  schema: {
    element: {
      properties: {
        value: property.string({ required: true }),
      },
      selectable: false,
      void: 'inline',
    },
  },
});

const TocPlugin = defineBasePlugin(PLUGINS.toc, {
  schema: {
    element: { void: 'block' },
  },
});

const BlockquotePlugin = defineBasePlugin(PLUGINS.blockquote, {
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent(),
    },
  }),
});

const SlashInputPlugin = defineBasePlugin('slashInput', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const MetadataMarkPlugin = defineBasePlugin('metadata', {
  schema: { mark: property.json() },
});

const testSuggestionData = {
  id: '1',
  createdAt: Date.now(),
  type: 'insert',
  userId: 'testId',
};

const inlineData = (editor: BaseEditor, node: Descendant) =>
  editor.plugin(BaseSuggestionPlugin).api.inlineData(node);

describe('BaseSuggestionPlugin behavior', () => {
  it('clears transient suggestion state from elements and text', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      initialValue: [
        {
          children: [
            { [SUGGESTION_TRANSIENT_KEY]: true, text: 'before' },
            {
              [SUGGESTION_TRANSIENT_KEY]: true,
              children: [{ text: '' }],
              label: 'Ada',
              ref: 'u1',
              type: 'mention',
            },
            { text: 'after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseSuggestionPlugin).update.clearTransient({
      at: [],
      mode: 'all',
      match: (node) => Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
    });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'before' },
          {
            children: [{ text: '' }],
            label: 'Ada',
            ref: 'u1',
            type: 'mention',
          },
          { text: 'after' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it.each([
    ['collapsed', 1],
    ['expanded', 2],
  ] as const)(
    'preserves open slice boundaries for a %s selection',
    (_, focus) => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: focus, path: [0, 0] },
          kind: 'text',
        },
        initialValue: [{ children: [{ text: 'abc' }], type: 'paragraph' }],
      });
      const slice = ContentSlice.fromJSON({
        content: [{ children: [{ text: 'X' }], type: 'paragraph' }],
        openEnd: 1,
        openStart: 1,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
      editor.update.slice.replace(slice);

      expect(editor.read.children()).toHaveLength(1);
      expect(editor.read.text.string([])).toBe('aXbc');
    }
  );

  it('toggles structurally equal JSON marks as active values', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MetadataMarkPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
        kind: 'text',
      },
      initialValue: [
        {
          children: [{ metadata: { ids: ['one'] }, text: 'test' }],
          type: 'paragraph',
        },
      ],
    } as any);

    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });
    editor.update.marks.toggle('metadata', { ids: ['one'] });

    const node = editor.read.children()[0].children[0] as any;
    const data = inlineData(editor, node);

    expect(node.metadata).toBeUndefined();
    expect(data).toMatchObject({
      properties: { metadata: { ids: ['one'] } },
      type: 'update',
    });
  });

  describe('insertText', () => {
    describe('when editor.plugin(SuggestionPlugin).store.get().isSuggesting is not defined', () => {
      it('does not add marks', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              testtest
              <cursor />
            </hp>
          </editor>
        ) as any;

        const editor = createBaseEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          initialValue: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: false });

        editor.update.text.insert('test');

        expect(editor.read.children()).toEqual(output.children);
      });
    });

    describe('when editor.plugin(SuggestionPlugin).store.get().isSuggesting is defined', () => {
      describe('when cursor is not in suggestion mark', () => {
        it('add marks and suggestion data', () => {
          const input = (
            <editor>
              <hp>
                test
                <cursor />
              </hp>
            </editor>
          ) as any;

          const editor = createBaseEditor({
            plugins: [suggestionPlugin],
            selection: input.selection,
            initialValue: input.children,
          });
          editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

          editor.update.text.insert('test');

          expect(
            editor.read.children()[0].children[1][
              editor.plugin(BaseSuggestionPlugin).schema.key
            ]
          ).toBeTruthy();

          const data = inlineData(
            editor,
            editor.read.children()[0].children[1]
          );
          expect(
            data?.createdAt && data?.id && data?.type && data?.userId
          ).toBeTruthy();
          expect(data?.type === 'insert').toBeTruthy();
          expect(data?.userId === 'testId').toBeTruthy();
          expect(typeof data?.createdAt === 'number').toBeTruthy();
        });

        it('tracks later inserts in the same transaction', () => {
          const input = (
            <editor>
              <hp>
                one
                <cursor />
              </hp>
              <hp>two</hp>
            </editor>
          ) as any;

          const editor = createBaseEditor({
            plugins: [suggestionPlugin],
            selection: input.selection,
            initialValue: input.children,
          });
          editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

          editor.update((tx) => {
            tx.command(editorCommands.insertText, { text: 'a' });
            tx.selection.set({ path: [1, 0], offset: 0 });
            tx.command(editorCommands.insertText, { text: 'b' });
          });

          const [firstBlock, secondBlock] = editor.read.children();
          const firstInsert = firstBlock.children.find(
            (node: any) => node.text === 'a'
          );
          const secondInsert = secondBlock.children.find(
            (node: any) => node.text === 'b'
          );

          expect(inlineData(editor, firstInsert as any)?.type).toBe('insert');
          expect(inlineData(editor, secondInsert as any)?.type).toBe('insert');
        });
      });

      describe('when cursor is in block suggestion', () => {
        it('does not add suggestion leaf', () => {
          const blockSuggestionData = {
            id: '1',
            createdAt: Date.now(),
            type: 'insert',
            userId: 'testId',
          };

          const input = (
            <editor>
              <hp suggestion={blockSuggestionData}>
                test1
                <cursor />
              </hp>
            </editor>
          ) as any;

          const output = (
            <editor>
              <hp suggestion={blockSuggestionData}>
                test1test2
                <cursor />
              </hp>
            </editor>
          ) as any;

          const editor = createBaseEditor({
            plugins: [suggestionPlugin],
            selection: input.selection,
            initialValue: input.children,
          });

          editor.update.text.insert('test2');

          expect(editor.read.children()).toEqual(output.children);
        });
      });
    });

    describe('when cursor is in suggestion mark', () => {
      it('does not add a new suggestion id', () => {
        const input = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                test
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                testtest
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any;

        const editor = createBaseEditor({
          plugins: [
            BaseSuggestionPlugin.configure({
              initialState: {
                currentUserId: 'testId',
              },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

        editor.update.text.insert('test');

        expect(editor.read.children()).toEqual(output.children);
      });
    });
  });
});

describe('when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  describe('delete backward', () => {
    describe('when there is no point before', () => {
      it('does not add a new suggestion id', () => {
        const input = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                <cursor />
                test
              </htext>
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                <cursor />
                test
              </htext>
            </hp>
          </editor>
        ) as any;

        const editor = createBaseEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          initialValue: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

        editor.update.text.deleteBackward();

        expect(editor.read.children()).toEqual(output.children);
      });
    });

    describe('when cursor is in block suggestion', () => {
      it('without set inline suggestion when delete backward in block suggestion', () => {
        const blockSuggestionData = {
          id: '1',
          createdAt: Date.now(),
          type: 'insert',
          userId: 'testId',
        };

        const input = (
          <editor>
            <hp suggestion={blockSuggestionData}>
              test
              <cursor />
            </hp>
          </editor>
        ) as any;

        const output = (
          <editor>
            <hp suggestion={blockSuggestionData}>
              tes
              <cursor />
            </hp>
          </editor>
        ) as any;

        const editor = createBaseEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          initialValue: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

        editor.update.text.deleteBackward();

        expect(editor.read.children()).toEqual(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      });
    });

    it('marks only the previous mention-shaped inline void and moves the cursor to its left edge', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hmention label="Ada" ref="u1">
              <htext />
            </hmention>
            <htext>
              <cursor />
            </htext>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext>
              a
              <cursor />
            </htext>
            <hmention label="Ada" ref="u1">
              <htext />
            </hmention>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward();

      const mentionNode = editor.read.children()[0].children[1] as any;
      const leftText = editor.read.children()[0].children[0] as any;
      const rightText = editor.read.children()[0].children[2] as any;
      const suggestionData = inlineData(editor, mentionNode);

      expect(leftText).toEqual(output.children[0].children[0]);
      expect(mentionNode.suggestion).toBe(true);
      expect(suggestionData?.type).toBe('remove');
      expect(suggestionData?.userId).toBe('testId');
      expect(rightText).toEqual(output.children[0].children[2]);
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(output.selection)
      );
    });

    it('marks the previous date-shaped inline void with remove suggestion metadata', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hdate value="2026-04-14">
              <htext />
            </hdate>
            <htext>
              <cursor />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, DatePlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward();

      const dateNode = editor.read.children()[0].children[1] as any;
      const dateChild = dateNode.children?.[0];
      const elementSuggestionData = inlineData(editor, dateNode);
      const childSuggestionData = inlineData(editor, dateChild);

      expect(dateNode.suggestion || dateChild?.suggestion).toBeTruthy();
      expect(elementSuggestionData ?? childSuggestionData).toMatchObject({
        type: 'remove',
        userId: 'testId',
      });
    });

    it('marks a date-shaped inline void when the cursor is inside its void child text', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hdate value="2026-04-14">
              <htext>
                <cursor />
              </htext>
            </hdate>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, DatePlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward();

      const dateNode = editor.read.children()[0].children[1] as any;
      const dateChild = dateNode.children?.[0];
      const suggestionData =
        inlineData(editor, dateNode) ?? inlineData(editor, dateChild);

      expect(dateNode.suggestion || dateChild?.suggestion).toBeTruthy();
      expect(suggestionData).toMatchObject({
        type: 'remove',
        userId: 'testId',
      });
    });

    it('does not delete a non-selectable date when backspacing inside later trailing text', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hdate value="2026-04-14">
              <htext />
            </hdate>
            <htext>
              b<cursor />c
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, DatePlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'character' });

      const paragraphChildren = editor.read.children()[0].children as any[];
      const leftText = paragraphChildren[0];
      const dateNode = paragraphChildren[1];
      const trailingNodes = paragraphChildren.slice(2);
      const dateSuggestion =
        inlineData(editor, dateNode) ??
        inlineData(editor, dateNode.children?.[0]);
      const trailingSuggestionNode = trailingNodes.find(
        (node) => inlineData(editor, node)?.type === 'remove'
      );

      expect(leftText).toEqual({ text: 'a' });
      expect(dateSuggestion).toBeUndefined();
      expect(trailingSuggestionNode?.text).toBe('b');
    });

    it('marks a remove line break when deleting backward at the start of a paragraph', () => {
      const input = (
        <editor>
          <hp>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'character' });

      const lineBreakSuggestion = (editor.read.children()[0] as any).suggestion;

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <hp
              suggestion={{
                createdAt: lineBreakSuggestion.createdAt,
                id: lineBreakSuggestion.id,
                isLineBreak: true,
                type: 'remove',
                userId: 'testId',
              }}
            >
              test1
              <cursor />
            </hp>
            <hp>test2</hp>
          </editor>
        ).children
      );
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(
          (
            <editor>
              <hp
                suggestion={{
                  createdAt: lineBreakSuggestion.createdAt,
                  id: lineBreakSuggestion.id,
                  isLineBreak: true,
                  type: 'remove',
                  userId: 'testId',
                }}
              >
                test1
                <cursor />
              </hp>
              <hp>test2</hp>
            </editor>
          ).selection
        )
      );
    });

    it('marks the previous block void for removal instead of creating a line-break suggestion', () => {
      const input = (
        <editor>
          <htoc>
            <htext />
          </htoc>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, TocPlugin],
        selection: input.selection,
        initialValue: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'character' });

      const voidSuggestion = (editor.read.children()[0] as any).suggestion;

      expect(editor.read.children()).toEqual(
        (
          <editor>
            <htoc
              suggestion={{
                createdAt: voidSuggestion.createdAt,
                id: voidSuggestion.id,
                type: 'remove',
                userId: 'testId',
              }}
            >
              <htext>
                <cursor />
              </htext>
            </htoc>
            <hp>test2</hp>
          </editor>
        ).children
      );
      expect(voidSuggestion.isLineBreak).toBeUndefined();
      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(
          (
            <editor>
              <htoc
                suggestion={{
                  createdAt: voidSuggestion.createdAt,
                  id: voidSuggestion.id,
                  type: 'remove',
                  userId: 'testId',
                }}
              >
                <htext>
                  <cursor />
                </htext>
              </htoc>
              <hp>test2</hp>
            </editor>
          ).selection
        )
      );
    });
  });
});

describe('when point before is not marked', () => {
  it('add a new suggestion id when remove backward', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.deleteBackward();

    const data = inlineData(editor, editor.read.children()[0].children[1]);

    expect(
      data?.createdAt && data?.id && data?.type && data?.userId
    ).toBeTruthy();
    expect(data?.type === 'remove').toBeTruthy();
    expect(data?.userId === 'testId').toBeTruthy();
    expect(editor.read.children()[0].children[0].text).toBe('tes');
    expect(typeof data?.createdAt === 'number').toBeTruthy();
  });
});

describe('when point before is marked', () => {
  it('does not add a new suggestion id when different type', () => {
    const input = (
      <editor>
        <hp>
          <htext suggestion_1={testSuggestionData} suggestion>
            test
          </htext>
          t
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.deleteBackward();

    const data1 = inlineData(editor, editor.read.children()[0].children[0]);
    const data2 = inlineData(editor, editor.read.children()[0].children[1]);

    expect(!!data1?.id && !!data2?.id).toEqual(true);
    expect(data1?.id !== data2?.id).toEqual(true);
  });
});

describe('when delete line', () => {
  it('add a new suggestion id', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.deleteBackward({ unit: 'line' });

    const data = inlineData(editor, editor.read.children()[0].children[0]);

    expect(
      data?.createdAt && data?.id && data?.type && data?.userId
    ).toBeTruthy();
    expect(data?.type === 'remove').toBeTruthy();
    expect(data?.userId === 'testId').toBeTruthy();
    expect(typeof data?.createdAt === 'number').toBeTruthy();
  });
});

describe('delete forward when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  it('marks the next character as a remove suggestion', () => {
    const input = (
      <editor>
        <hp>
          o<cursor />
          ne
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.deleteForward();

    const data = inlineData(editor, editor.read.children()[0].children[1]);

    expect(editor.read.children()[0].children[0].text).toBe('o');
    expect(editor.read.children()[0].children[2].text).toBe('e');
    expect(data).toMatchObject({
      type: 'remove',
      userId: 'testId',
    });
  });
});

describe('delete fragment when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  it('turns the selected text into a remove suggestion and collapses at the start', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          one
          <focus />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.fragment.delete();

    const data = inlineData(editor, editor.read.children()[0].children[0]);

    expect(editor.read.children()[0].children[0].text).toBe('one');
    expect(data).toMatchObject({
      type: 'remove',
      userId: 'testId',
    });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('keeps the cursor at the start of an expanded selection that spans text, a mention-shaped inline void, and trailing text', () => {
    const input = (
      <editor>
        <hp>
          <htext>
            before <anchor />
            text{' '}
          </htext>
          <hmention label="Ada" ref="u1">
            <htext />
          </hmention>
          <htext>
            {' after'}
            <focus />
            {' text'}
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.fragment.delete();

    const output = (
      <editor>
        <hp>
          <htext>before </htext>
          <htext suggestion>
            <cursor />
            text{' '}
          </htext>
          <hmention label="Ada" ref="u1" suggestion>
            <htext />
          </hmention>
          <htext suggestion>{' after'}</htext>
          <htext>{' text'}</htext>
        </hp>
      </editor>
    ) as any;

    expect(editor.read.children()[0].children).toHaveLength(
      output.children[0].children.length
    );

    const leftText = editor.read.children()[0].children[0] as any;
    const removeTextNode = editor.read.children()[0].children[1] as any;
    const mentionNode = editor.read.children()[0].children[2] as any;
    const removeTrailingTextNode = editor.read.children()[0].children[3] as any;
    const trailingText = editor.read.children()[0].children[4] as any;
    const removeData = inlineData(editor, removeTextNode);
    const mentionData = inlineData(editor, mentionNode);
    const trailingRemoveData = inlineData(editor, removeTrailingTextNode);

    expect(leftText).toEqual(output.children[0].children[0]);
    expect(removeTextNode.text).toBe(output.children[0].children[1].text);
    expect(removeData?.type).toBe('remove');
    expect(removeData?.userId).toBe('testId');
    expect(mentionNode.children).toEqual(
      output.children[0].children[2].children
    );
    expect(mentionData?.id).toBe(removeData?.id);
    expect(mentionData?.type).toBe('remove');
    expect(mentionData?.userId).toBe('testId');
    expect(removeTrailingTextNode.text).toBe(
      output.children[0].children[3].text
    );
    expect(trailingRemoveData?.id).toBe(removeData?.id);
    expect(trailingRemoveData?.type).toBe('remove');
    expect(trailingRemoveData?.userId).toBe('testId');
    expect(trailingText).toEqual(output.children[0].children[4]);
    expect(editor.read.selection()).toEqual(
      projectTestSelectionRange(output.selection)
    );
  });
});

describe('normalizeNode', () => {
  describe('when there is a suggestion mark without data', () => {
    it('remove mark', () => {
      const input = (
        <editor>
          <hp>
            <htext suggestion>
              test
              <cursor />
            </htext>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.value.repair();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});

describe('insert text when cursor is expanded', () => {
  it('reuses the same suggestion id', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          test
          <focus />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.insert('1');

    expect(editor.read.children()[0].children).toHaveLength(2);

    const removedNode = editor.read.children()[0].children[0];
    const removeNodeData = inlineData(editor, removedNode);
    const insertedNode = editor.read.children()[0].children[1];
    const insertedNodeData = inlineData(editor, insertedNode);

    expect(removedNode.text).toEqual('test');
    expect(insertedNode.text).toEqual('1');
    expect(removeNodeData?.id).toEqual(insertedNodeData?.id);
    expect(removeNodeData?.type).toEqual('remove');
    expect(insertedNodeData?.type).toEqual('insert');
  });

  it('replaces an expanded selection across text, a mention-shaped inline void, and trailing text without looping', () => {
    const input = (
      <editor>
        <hp>
          <htext>
            before <anchor />
            text{' '}
          </htext>
          <hmention label="Ada" ref="u1">
            <htext />
          </hmention>
          <htext>
            {' after'}
            <focus />
            {' text'}
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, MentionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.text.insert('X');

    const output = (
      <editor>
        <hp>
          <htext>before </htext>
          <htext suggestion>{'text '}</htext>
          <hmention label="Ada" ref="u1" suggestion>
            <htext />
          </hmention>
          <htext suggestion>{' after'}</htext>
          <htext suggestion>
            X<cursor />
          </htext>
          <htext>{' text'}</htext>
        </hp>
      </editor>
    ) as any;

    expect(editor.read.children()[0].children).toHaveLength(
      output.children[0].children.length
    );

    const leftText = editor.read.children()[0].children[0] as any;
    const removeTextNode = editor.read.children()[0].children[1] as any;
    const mentionNode = editor.read.children()[0].children[2] as any;
    const removeTrailingTextNode = editor.read.children()[0].children[3] as any;
    const insertedNode = editor.read.children()[0].children[4] as any;
    const trailingText = editor.read.children()[0].children[5] as any;
    const removeData = inlineData(editor, removeTextNode);
    const mentionData = inlineData(editor, mentionNode);
    const trailingRemoveData = inlineData(editor, removeTrailingTextNode);
    const insertData = inlineData(editor, insertedNode);

    expect(leftText).toEqual(output.children[0].children[0]);
    expect(removeTextNode.text).toBe(output.children[0].children[1].text);
    expect(removeData?.type).toBe('remove');
    expect(removeData?.userId).toBe('testId');
    expect(mentionNode.children).toEqual(
      output.children[0].children[2].children
    );
    expect(mentionData?.id).toBe(removeData?.id);
    expect(mentionData?.type).toBe('remove');
    expect(mentionData?.userId).toBe('testId');
    expect(removeTrailingTextNode.text).toBe(
      output.children[0].children[3].text
    );
    expect(trailingRemoveData?.id).toBe(removeData?.id);
    expect(trailingRemoveData?.type).toBe('remove');
    expect(trailingRemoveData?.userId).toBe('testId');
    expect(insertedNode.text).toBe(output.children[0].children[4].text);
    expect(insertData?.id).toBe(removeData?.id);
    expect(insertData?.type).toBe('insert');
    expect(insertData?.userId).toBe('testId');
    expect(trailingText).toEqual(output.children[0].children[5]);
    expect(editor.read.selection()).toEqual(
      projectTestSelectionRange(output.selection)
    );
  });
});

describe('insertBreak when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  it('inserts a newline suggestion inside nested blocks instead of splitting structure', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BlockquotePlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.break.insert();

    const inserted = (editor.read.children()[0] as any).children[0].children[0];

    expect(inserted.text).toBe('\n');
    expect(inlineData(editor, inserted)).toMatchObject({
      type: 'insert',
      userId: 'testId',
    });
  });
});

describe('insertNodes when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  it('wraps inserted blocks with block suggestion metadata', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.nodes.insert({
      children: [{ text: 'two' }],
      type: 'paragraph',
    } as any);

    expect((editor.read.children()[1] as any).suggestion).toMatchObject({
      type: 'insert',
      userId: 'testId',
    });
  });

  it('bypasses suggestion wrapping for slashInput nodes', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, SlashInputPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.nodes.insert({
      children: [{ text: '' }],
      type: 'slashInput',
    } as any);

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'slashInput',
    });
    expect((editor.read.children()[1] as any).suggestion).toBeUndefined();
  });
});

describe('removeNodes when editor.plugin(SuggestionPlugin).store.get().isSuggesting is true', () => {
  it('marks every matched block with the same remove suggestion metadata', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          one
        </hp>
        <hp>
          two
          <focus />
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      initialValue: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.nodes.remove({
      at: [],
      type: 'paragraph',
    });

    const firstSuggestion = (editor.read.children()[0] as any).suggestion;
    const secondSuggestion = (editor.read.children()[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({ type: 'remove' });
    expect(secondSuggestion).toMatchObject({ type: 'remove' });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });

  it('bypasses suggestions when removing slashInput nodes', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin, SlashInputPlugin],
      initialValue: [
        {
          children: [{ text: 'one' }],
          type: 'paragraph',
        },
        {
          children: [{ text: '' }],
          type: 'slashInput',
        },
      ],
    });
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    editor.update.nodes.remove({
      at: [],
      type: 'slashInput',
    });

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'one' }],
      type: 'paragraph',
    });
  });
});
