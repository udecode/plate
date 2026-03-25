/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { getInlineSuggestionData } from './utils';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

const testSuggestionData = {
  id: '1',
  createdAt: Date.now(),
  type: 'insert',
  userId: 'testId',
};

describe('withSuggestion', () => {
  describe('insertText', () => {
    describe('when editor.getOptions(SuggestionPlugin).isSuggesting is not defined', () => {
      it('does not add marks', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              testtest
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          value: input.children,
        });
        editor.setOption(BaseSuggestionPlugin, 'isSuggesting', false);

        editor.tf.insertText('test');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('when editor.getOptions(SuggestionPlugin).isSuggesting is defined', () => {
      describe('when cursor is not in suggestion mark', () => {
        it('add marks and suggestion data', () => {
          const input = (
            <editor>
              <hp>
                test
                <cursor />
              </hp>
            </editor>
          ) as any as SlateEditor;

          const editor = createSlateEditor({
            plugins: [suggestionPlugin],
            selection: input.selection,
            value: input.children,
          });
          editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

          editor.tf.insertText('test');

          expect(
            editor.children[0].children[1][BaseSuggestionPlugin.key]
          ).toBeTruthy();

          const data = getInlineSuggestionData(
            editor.children[0].children[1] as any
          );
          expect(
            data?.createdAt && data?.id && data?.type && data?.userId
          ).toBeTruthy();
          expect(data?.type === 'insert').toBeTruthy();
          expect(data?.userId === 'testId').toBeTruthy();
          expect(typeof data?.createdAt === 'number').toBeTruthy();
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
          ) as any as SlateEditor;

          const output = (
            <editor>
              <hp suggestion={blockSuggestionData}>
                test1test2
                <cursor />
              </hp>
            </editor>
          ) as any as SlateEditor;

          const editor = createSlateEditor({
            plugins: [suggestionPlugin],
            selection: input.selection,
            value: input.children,
          });

          editor.tf.insertText('test2');

          expect(editor.children).toEqual(output.children);
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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                testtest
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
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
        editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

        editor.tf.insertText('test');

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});

describe('when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp>
              <htext suggestion_1={testSuggestionData} suggestion>
                <cursor />
                test
              </htext>
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          value: input.children,
        });
        editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

        editor.tf.deleteBackward();

        expect(editor.children).toEqual(output.children);
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
        ) as any as SlateEditor;

        const output = (
          <editor>
            <hp suggestion={blockSuggestionData}>
              tes
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          plugins: [suggestionPlugin],
          selection: input.selection,
          value: input.children,
        });
        editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

        editor.tf.deleteBackward();

        expect(editor.children).toEqual(output.children);
        expect(editor.selection).toEqual(output.selection);
      });
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteBackward();

    const data = getInlineSuggestionData(editor.children[0].children[1] as any);

    expect(
      data?.createdAt && data?.id && data?.type && data?.userId
    ).toBeTruthy();
    expect(data?.type === 'remove').toBeTruthy();
    expect(data?.userId === 'testId').toBeTruthy();
    expect(editor.children[0].children[0].text).toBe('tes');
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteBackward();

    const data1 = getInlineSuggestionData(
      editor.children[0].children[0] as any
    );
    const data2 = getInlineSuggestionData(
      editor.children[0].children[1] as any
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteBackward('line');

    const data = getInlineSuggestionData(editor.children[0].children[0] as any);

    expect(
      data?.createdAt && data?.id && data?.type && data?.userId
    ).toBeTruthy();
    expect(data?.type === 'remove').toBeTruthy();
    expect(data?.userId === 'testId').toBeTruthy();
    expect(typeof data?.createdAt === 'number').toBeTruthy();
  });
});

describe('delete forward when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
  it('marks the next character as a remove suggestion', () => {
    const input = (
      <editor>
        <hp>
          o<cursor />
          ne
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteForward();

    const data = getInlineSuggestionData(editor.children[0].children[1] as any);

    expect(editor.children[0].children[0].text).toBe('o');
    expect(editor.children[0].children[2].text).toBe('e');
    expect(data).toMatchObject({
      type: 'remove',
      userId: 'testId',
    });
  });
});

describe('delete fragment when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
  it('turns the selected text into a remove suggestion and collapses at the start', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          one
          <focus />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteFragment();

    const data = getInlineSuggestionData(editor.children[0].children[0] as any);

    expect(editor.children[0].children[0].text).toBe('one');
    expect(data).toMatchObject({
      type: 'remove',
      userId: 'testId',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
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
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [BaseSuggestionPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalize({
        force: true,
      });

      expect(editor.children).toEqual(output.children);
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
      ) as any as SlateEditor;
      const output = (
        <editor>
          <hp>x</hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [suggestionPlugin],
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
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
      ) as any as SlateEditor;
      const output = (
        <editor>
          <hp>x</hp>
          <hp>
            <htext />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createSlateEditor({
        plugins: [suggestionPlugin],
        value: input.children,
      });

      editor.tf.normalize({ force: true });

      expect(editor.children).toEqual(output.children);
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.insertText('1');

    expect(editor.children[0].children).toHaveLength(2);

    const removedNode = editor.children[0].children[0];
    const removeNodeData = getInlineSuggestionData(removedNode as any);
    const insertedNode = editor.children[0].children[1];
    const insertedNodeData = getInlineSuggestionData(insertedNode as any);

    expect(removedNode.text).toEqual('test');
    expect(insertedNode.text).toEqual('1');
    expect(removeNodeData?.id).toEqual(insertedNodeData?.id);
    expect(removeNodeData?.type).toEqual('remove');
    expect(insertedNodeData?.type).toEqual('insert');
  });
});

describe('insertBreak when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
  it('inserts a newline suggestion inside nested blocks instead of splitting structure', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.insertBreak();

    const inserted = ((editor.children[0] as any).children[0] as any)
      .children[0] as any;

    expect(inserted.text).toBe('\n');
    expect(getInlineSuggestionData(inserted)).toMatchObject({
      type: 'insert',
      userId: 'testId',
    });
  });
});

describe('insertNodes when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
  it('wraps inserted blocks with block suggestion metadata', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.insertNodes({
      children: [{ text: 'two' }],
      type: 'p',
    } as any);

    expect((editor.children[1] as any).suggestion).toMatchObject({
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.insertNodes({
      children: [{ text: '' }],
      type: 'slash_input',
    } as any);

    expect(editor.children[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'slash_input',
    });
    expect((editor.children[1] as any).suggestion).toBeUndefined();
  });
});

describe('removeNodes when editor.getOptions(SuggestionPlugin).isSuggesting is true', () => {
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.removeNodes({
      at: [],
      match: (n: any) => n.type === 'p',
    });

    const firstSuggestion = (editor.children[0] as any).suggestion;
    const secondSuggestion = (editor.children[1] as any).suggestion;

    expect(firstSuggestion).toMatchObject({ type: 'remove' });
    expect(secondSuggestion).toMatchObject({ type: 'remove' });
    expect(firstSuggestion.id).toBe(secondSuggestion.id);
    expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
  });

  it('bypasses suggestions when removing slash_input nodes', () => {
    const editor = createSlateEditor({
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
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.removeNodes({
      at: [],
      match: (n: any) => n.type === 'slash_input',
    });

    expect(editor.children).toHaveLength(1);
    expect(editor.children[0]).toMatchObject({
      children: [{ text: 'one' }],
      type: 'p',
    });
  });
});
