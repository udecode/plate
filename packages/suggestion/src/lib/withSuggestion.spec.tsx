/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

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
      it('should not add marks', () => {
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
        it('should add marks and suggestion data', () => {
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
        it('should not add suggestion leaf', () => {
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
      it('should not add a new suggestion id', () => {
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
      it('should not add a new suggestion id', () => {
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
  it('should add a new suggestion id when remove backward', () => {
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
  it('should not add a new suggestion id when different type', () => {
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
  it('should add a new suggestion id', () => {
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

describe('normalizeNode', () => {
  describe('when there is a suggestion mark without data', () => {
    it('should remove mark', () => {
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
});

describe('insert text when cursor is expanded', () => {
  it('it should use same suggestion id', () => {
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
