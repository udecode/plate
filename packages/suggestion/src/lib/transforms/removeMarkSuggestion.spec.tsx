/** @jsx jsxt */

import { type TUpdateSuggestionData } from '@platejs/utils';

import { jsxt } from '@platejs/test-utils';
import { createBaseEditor } from '@platejs/core';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('removeMarkSuggestion', () => {
  it('remove mark with suggestion data', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            <anchor />
            test
            <focus />
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
    editor.update.marks.remove('bold');

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[0] as any
    ) as TUpdateSuggestionData;

    expect(editor.read.children()[0].children[0].bold).toBeUndefined();
    expect(
      editor.read.children()[0].children[0][BaseSuggestionPlugin.key]
    ).toBe(true);
    expect(data).toBeDefined();
    expect(data?.type).toBe('update');
    expect(data?.userId).toBe('testId');
    expect(data?.properties).toEqual({ bold: undefined });
    expect(typeof data?.createdAt).toBe('number');
    expect(typeof data?.id).toBe('string');
  });

  it('add new suggestion mark while preserving existing suggestion mark', () => {
    const existingData = {
      id: '1',
      createdAt: Date.now(),
      properties: { italic: undefined },
      type: 'update' as const,
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          <htext suggestion_1={existingData} bold italic suggestion>
            te
            <anchor />
            st
            <focus />
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
    editor.update.marks.remove('bold');

    const dataList = editor
      .plugin(BaseSuggestionPlugin)
      .api.dataList(
        editor.read.children()[0].children[0] as any
      ) as TUpdateSuggestionData[];

    expect(dataList).toHaveLength(2);
    expect(dataList[0]).toEqual(existingData);
    expect(dataList[1].type).toBe('update');
    expect(dataList[1].properties).toEqual({ bold: undefined });
    expect(dataList[1].id !== existingData.id).toBeTruthy();
    // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
  });

  it('skips nodes already marked by a non-update suggestion', () => {
    const existingData = {
      createdAt: Date.now(),
      id: '1',
      type: 'insert',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          <htext bold suggestion_1={existingData as any} suggestion>
            <anchor />
            test
            <focus />
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
    editor.update.marks.remove('bold');

    const node = editor.read.children()[0].children[0] as any;

    expect(node.bold).toBe(true);
    expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
      existingData,
    ] as any);
  });
});
