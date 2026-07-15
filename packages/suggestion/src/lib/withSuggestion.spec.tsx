/** @jsx jsxt */

import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { jsxt } from '@platejs/test-utils';
import { createBaseEditor } from '@platejs/core';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { getInlineSuggestionData } from './utils';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

const MentionPlugin = createBasePlugin({
  key: KEYS.mention,
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
});

const DatePlugin = createBasePlugin({
  key: KEYS.date,
  node: { isElement: true, isInline: true, isSelectable: false, isVoid: true },
});

const TocPlugin = createBasePlugin({
  key: KEYS.toc,
  node: { isElement: true, isVoid: true },
});

const testSuggestionData = {
  id: '1',
  createdAt: Date.now(),
  type: 'insert',
  userId: 'testId',
};

describe('withSuggestion', () => {
  describe('insertText', () => {
    describe('when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is not defined', () => {
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
          value: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', false);

        editor.update.text.insert('test');

        expect(editor.read.children()).toEqual(output.children);
      });
    });

    describe('when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is defined', () => {
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
            value: input.children,
          });
          editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

          editor.update.text.insert('test');

          expect(
            editor.read.children()[0].children[1][BaseSuggestionPlugin.key]
          ).toBeTruthy();

          const data = getInlineSuggestionData(
            editor.read.children()[0].children[1] as any
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
            value: input.children,
          });
          editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

          editor.update((tx) => {
            tx.text.insert('a');
            tx.selection.set({ path: [1, 0], offset: 0 });
            tx.text.insert('b');
          });

          const [firstBlock, secondBlock] = editor.read.children();
          const firstInsert = firstBlock.children.find(
            (node: any) => node.text === 'a'
          );
          const secondInsert = secondBlock.children.find(
            (node: any) => node.text === 'b'
          );

          expect(getInlineSuggestionData(firstInsert as any)?.type).toBe(
            'insert'
          );
          expect(getInlineSuggestionData(secondInsert as any)?.type).toBe(
            'insert'
          );
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
            value: input.children,
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
              options: {
                currentUserId: 'testId',
              },
            }),
          ],
          selection: input.selection,
          value: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

        editor.update.text.insert('test');

        expect(editor.read.children()).toEqual(output.children);
      });
    });
  });
});

describe('when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
          value: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

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
          value: input.children,
        });
        editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

        editor.update.text.deleteBackward();

        expect(editor.read.children()).toEqual(output.children);
        expect(editor.read.selection()).toEqual(output.selection);
      });
    });

    it('marks only the previous mention-shaped inline void and moves the cursor to its left edge', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hmention key="u1" value="Ada">
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
            <hmention key="u1" value="Ada">
              <htext />
            </hmention>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: input.selection,
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward();

      const mentionNode = editor.read.children()[0].children[1] as any;
      const leftText = editor.read.children()[0].children[0] as any;
      const rightText = editor.read.children()[0].children[2] as any;
      const suggestionData = getInlineSuggestionData(mentionNode);

      expect(leftText).toEqual(output.children[0].children[0]);
      expect(mentionNode.suggestion).toBe(true);
      expect(suggestionData?.type).toBe('remove');
      expect(suggestionData?.userId).toBe('testId');
      expect(rightText).toEqual(output.children[0].children[2]);
      expect(editor.read.selection()).toEqual(output.selection);
    });

    it('marks the previous date-shaped inline void with remove suggestion metadata', () => {
      const input = (
        <editor>
          <hp>
            <htext>a</htext>
            <hdate date="2026-04-14">
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
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward();

      const dateNode = editor.read.children()[0].children[1] as any;
      const dateChild = dateNode.children?.[0] as any;
      const elementSuggestionData = getInlineSuggestionData(dateNode);
      const childSuggestionData = getInlineSuggestionData(dateChild);

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
            <hdate date="2026-04-14">
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
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward();

      const dateNode = editor.read.children()[0].children[1] as any;
      const dateChild = dateNode.children?.[0] as any;
      const suggestionData =
        getInlineSuggestionData(dateNode) ?? getInlineSuggestionData(dateChild);

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
            <hdate date="2026-04-14">
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
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward({ unit: 'character' });

      const paragraphChildren = editor.read.children()[0].children as any[];
      const leftText = paragraphChildren[0];
      const dateNode = paragraphChildren[1];
      const trailingNodes = paragraphChildren.slice(2);
      const dateSuggestion =
        getInlineSuggestionData(dateNode) ??
        getInlineSuggestionData(dateNode.children?.[0]);
      const trailingSuggestionNode = trailingNodes.find(
        (node) => getInlineSuggestionData(node)?.type === 'remove'
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
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

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
        value: input.children,
      });
      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteBackward();

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[1] as any
    );

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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteBackward();

    const data1 = getInlineSuggestionData(
      editor.read.children()[0].children[0] as any
    );
    const data2 = getInlineSuggestionData(
      editor.read.children()[0].children[1] as any
    );

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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteBackward({ unit: 'line' });

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[0] as any
    );

    expect(
      data?.createdAt && data?.id && data?.type && data?.userId
    ).toBeTruthy();
    expect(data?.type === 'remove').toBeTruthy();
    expect(data?.userId === 'testId').toBeTruthy();
    expect(typeof data?.createdAt === 'number').toBeTruthy();
  });
});

describe('delete forward when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteForward();

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[1] as any
    );

    expect(editor.read.children()[0].children[0].text).toBe('o');
    expect(editor.read.children()[0].children[2].text).toBe('e');
    expect(data).toMatchObject({
      type: 'remove',
      userId: 'testId',
    });
  });
});

describe('delete fragment when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.fragment.delete();

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[0] as any
    );

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
          <hmention key="u1" value="Ada">
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.fragment.delete();

    const output = (
      <editor>
        <hp>
          <htext>before </htext>
          <htext suggestion>
            <cursor />
            text{' '}
          </htext>
          <hmention key="u1" suggestion value="Ada">
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
    const removeData = getInlineSuggestionData(removeTextNode);
    const mentionData = getInlineSuggestionData(mentionNode);
    const trailingRemoveData = getInlineSuggestionData(removeTrailingTextNode);

    expect(leftText).toEqual(output.children[0].children[0]);
    expect(removeTextNode.text).toBe(
      (output.children[0].children[1] as any).text
    );
    expect(removeData?.type).toBe('remove');
    expect(removeData?.userId).toBe('testId');
    expect(mentionNode.children).toEqual(
      output.children[0].children[2].children
    );
    expect(mentionData?.id).toBe(removeData?.id);
    expect(mentionData?.type).toBe('remove');
    expect(mentionData?.userId).toBe('testId');
    expect(removeTrailingTextNode.text).toBe(
      (output.children[0].children[3] as any).text
    );
    expect(trailingRemoveData?.id).toBe(removeData?.id);
    expect(trailingRemoveData?.type).toBe('remove');
    expect(trailingRemoveData?.userId).toBe('testId');
    expect(trailingText).toEqual(output.children[0].children[4]);
    expect(editor.read.selection()).toEqual(output.selection);
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
        value: input.children,
      });

      editor.update.normalize({
        force: true,
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when an inline remove suggestion has no user id', () => {
    it('unsets the suggestion metadata but keeps the text', () => {
      const input = (
        <editor>
          <hp>
            <htext
              suggestion
              suggestion_remove={{
                createdAt: 1,
                id: 'remove',
                type: 'remove',
                userId: null,
              }}
            >
              x
            </htext>
          </hp>
        </editor>
      ) as any;
      const output = (
        <editor>
          <hp>x</hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        value: input.children,
      });

      editor.update.normalize({ force: true });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when an inline insert suggestion has no user id', () => {
    it('removes the inserted text and leaves an empty text node behind', () => {
      const input = (
        <editor>
          <hp>x</hp>
          <hp>
            <htext
              suggestion
              suggestion_insert={{
                createdAt: 1,
                id: 'insert',
                type: 'insert',
                userId: null,
              }}
            >
              y
            </htext>
          </hp>
        </editor>
      ) as any;
      const output = (
        <editor>
          <hp>x</hp>
          <hp>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        value: input.children,
      });

      editor.update.normalize({ force: true });

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
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.insert('1');

    expect(editor.read.children()[0].children).toHaveLength(2);

    const removedNode = editor.read.children()[0].children[0];
    const removeNodeData = getInlineSuggestionData(removedNode as any);
    const insertedNode = editor.read.children()[0].children[1];
    const insertedNodeData = getInlineSuggestionData(insertedNode as any);

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
          <hmention key="u1" value="Ada">
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
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.insert('X');

    const output = (
      <editor>
        <hp>
          <htext>before </htext>
          <htext suggestion>{'text '}</htext>
          <hmention key="u1" suggestion value="Ada">
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
    const removeData = getInlineSuggestionData(removeTextNode);
    const mentionData = getInlineSuggestionData(mentionNode);
    const trailingRemoveData = getInlineSuggestionData(removeTrailingTextNode);
    const insertData = getInlineSuggestionData(insertedNode);

    expect(leftText).toEqual(output.children[0].children[0]);
    expect(removeTextNode.text).toBe(
      (output.children[0].children[1] as any).text
    );
    expect(removeData?.type).toBe('remove');
    expect(removeData?.userId).toBe('testId');
    expect(mentionNode.children).toEqual(
      output.children[0].children[2].children
    );
    expect(mentionData?.id).toBe(removeData?.id);
    expect(mentionData?.type).toBe('remove');
    expect(mentionData?.userId).toBe('testId');
    expect(removeTrailingTextNode.text).toBe(
      (output.children[0].children[3] as any).text
    );
    expect(trailingRemoveData?.id).toBe(removeData?.id);
    expect(trailingRemoveData?.type).toBe('remove');
    expect(trailingRemoveData?.userId).toBe('testId');
    expect(insertedNode.text).toBe(
      (output.children[0].children[4] as any).text
    );
    expect(insertData?.id).toBe(removeData?.id);
    expect(insertData?.type).toBe('insert');
    expect(insertData?.userId).toBe('testId');
    expect(trailingText).toEqual(output.children[0].children[5]);
    expect(editor.read.selection()).toEqual(output.selection);
  });
});

describe('insertBreak when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.break.insert();

    const inserted = ((editor.read.children()[0] as any).children[0] as any)
      .children[0] as any;

    expect(inserted.text).toBe('\n');
    expect(getInlineSuggestionData(inserted)).toMatchObject({
      type: 'insert',
      userId: 'testId',
    });
  });
});

describe('insertNodes when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.nodes.insert({
      children: [{ text: 'two' }],
      type: 'p',
    } as any);

    expect((editor.read.children()[1] as any).suggestion).toMatchObject({
      type: 'insert',
      userId: 'testId',
    });
  });

  it('bypasses suggestion wrapping for slash_input nodes', () => {
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.nodes.insert({
      children: [{ text: '' }],
      type: 'slash_input',
    } as any);

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'slash_input',
    });
    expect((editor.read.children()[1] as any).suggestion).toBeUndefined();
  });
});

describe('removeNodes when editor.plugin(SuggestionPlugin).getOptions().isSuggesting is true', () => {
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
      value: input.children,
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.nodes.remove({
      at: [],
      match: { type: 'p' },
    });

    const firstSuggestion = (editor.read.children()[0] as any).suggestion;
    const secondSuggestion = (editor.read.children()[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({ type: 'remove' });
    expect(secondSuggestion).toMatchObject({ type: 'remove' });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });

  it('bypasses suggestions when removing slash_input nodes', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      value: [
        {
          children: [{ text: 'one' }],
          type: 'p',
        },
        {
          children: [{ text: '' }],
          type: 'slash_input',
        },
      ],
    });
    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.nodes.remove({
      at: [],
      match: { type: 'slash_input' },
    });

    expect(editor.read.children()).toHaveLength(1);
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'one' }],
      type: 'p',
    });
  });
});
