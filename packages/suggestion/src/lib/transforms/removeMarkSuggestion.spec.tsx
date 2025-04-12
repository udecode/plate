/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import type { TUpdateSuggestionData } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('removeMarkSuggestion', () => {
  it('should remove mark with suggestion data', () => {
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);
    editor.tf.removeMark('bold');

    const data = getInlineSuggestionData(
      editor.children[0].children[0] as any
    ) as TUpdateSuggestionData;

    expect(editor.children[0].children[0].bold).toBeUndefined();
    expect(editor.children[0].children[0][BaseSuggestionPlugin.key]).toBe(true);
    expect(data).toBeDefined();
    expect(data?.type).toBe('update');
    expect(data?.userId).toBe('testId');
    expect(data?.properties).toEqual({ bold: undefined });
    expect(typeof data?.createdAt).toBe('number');
    expect(typeof data?.id).toBe('string');
  });

  it('should add new suggestion mark while preserving existing suggestion mark', () => {
    const existingData = {
      id: '1',
      createdAt: Date.now(),
      properties: { italic: undefined },
      type: 'update',
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
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);
    editor.tf.removeMark('bold');

    const dataList = editor
      .getApi(BaseSuggestionPlugin)
      .suggestion.dataList(
        editor.children[0].children[0] as any
      ) as TUpdateSuggestionData[];

    expect(dataList).toHaveLength(2);
    expect(dataList[0]).toEqual(existingData);
    expect(dataList[1].type).toBe('update');
    expect(dataList[1].properties).toEqual({ bold: undefined });
    expect(dataList[1].id !== existingData.id).toBeTruthy();
    // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
  });
});
