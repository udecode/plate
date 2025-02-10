/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import type { TSuggestionLineBreak } from './types';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from './BaseSuggestionPlugin';
import { getSuggestionData, getSuggestionLineBreakData } from './utils';
jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

const testLineBreakDataInsert = {
  id: '1',
  createdAt: Date.now(),
  type: 'insert',
  userId: 'testId',
};

const testLineBreakDataRemove = {
  id: '2',
  createdAt: Date.now(),
  type: 'remove',
  userId: 'testId',
};

describe('insertBreakSuggestion when isSuggesting is true', () => {
  it('should add insertBreakData and split node', () => {
    const input = (
      <editor>
        <hp>
          test1
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.insertBreak();

    const data = editor.children[0][
      SUGGESTION_KEYS.lineBreak
    ] as TSuggestionLineBreak;

    expect(editor.children).toHaveLength(2);
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.createdAt).toBeDefined();
    expect(data.type).toBe('insert');
    expect(data.userId).toBe('testId');
  });

  it('should not add new suggestion id if the previous node is a line break', () => {
    const input = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataInsert}>test1</hp>
        <hp>
          <cursor />
          test2
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

    const data = getSuggestionData(editor.children[1].children[0] as any);

    expect(data).toBeDefined();
    expect(data?.id === testLineBreakDataInsert.id).toBeTruthy();
    expect(data?.createdAt === testLineBreakDataInsert.createdAt).toBeTruthy();
    expect(data?.type === testLineBreakDataInsert.type).toBeTruthy();
    expect(data?.userId === testLineBreakDataInsert.userId).toBeTruthy();
  });

  it('should remove the lineBreak when type is insert', () => {
    const input = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataInsert}>test1</hp>
        <hp>
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          test1
          <cursor />
          test2
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

  it('should not remove the lineBreak when type is remove', () => {
    const input = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataRemove}>test1</hp>
        <hp>
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataRemove}>
          test1
          <cursor />
        </hp>
        <hp>test2</hp>
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

  it('should same id when remove cross blocks', () => {
    const input = (
      <editor>
        <hp>test1</hp>
        <hp>
          test2
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
    editor.tf.deleteBackward('character');

    const lineBreakData = getSuggestionLineBreakData(editor.children[0] as any);
    const suggestionTextData = getSuggestionData(
      editor.children[1].children[0] as any
    );

    expect(lineBreakData).toBeDefined();
    expect(suggestionTextData).toBeDefined();
    expect(lineBreakData?.id === suggestionTextData?.id).toBeTruthy();
    expect(editor.children[1].children[0].text).toBe('test2');
  });
});

describe('insertBreakSuggestion when isSuggesting is false', () => {
  it('should remove the lineBreak when type is insert', () => {
    const input = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataInsert}>test1</hp>
        <hp>
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          test1
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', false);

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(output.children);
  });

  it('should remove the lineBreak when type is remove', () => {
    const input = (
      <editor>
        <hp suggestionLineBreak={testLineBreakDataRemove}>test1</hp>
        <hp>
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          test1
          <cursor />
          test2
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', false);

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(output.children);
  });
});
