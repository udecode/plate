/** @jsx jsxt */

import type { BasePlateEditor, TUpdateSuggestionData } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';
import { getSuggestionApi } from '../utils/getSuggestionApi';

jsxt;

const createBasePlateEditor = ({ selection, value, ...options }: any = {}) =>
  createPlateRuntimeEditor({
    ...options,
    initialSelection: selection,
    initialValue: value,
  }) as any as BasePlateEditor;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('addMarkSuggestion', () => {
  it('add mark with suggestion data', () => {
    const input = (
      <editor>
        <hp>
          <anchor />
          test
          <focus />
        </hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);
    editor.update((tx) => tx.marks.add('bold', true));

    const data = getInlineSuggestionData(
      editor.children[0].children[0] as any
    ) as TUpdateSuggestionData;

    expect(editor.children[0].children[0].bold).toBe(true);
    expect(editor.children[0].children[0][BaseSuggestionPlugin.key]).toBe(true);
    expect(data).toBeDefined();
    expect(data?.type).toBe('update');
    expect(data?.userId).toBe('testId');
    expect(data?.newProperties).toEqual({ bold: true });
    expect(typeof data?.createdAt).toBe('number');
    expect(typeof data?.id).toBe('string');
  });

  it('add new suggestion mark while preserving existing suggestion mark', () => {
    const existingData = {
      id: '1',
      createdAt: Date.now(),
      newProperties: { bold: true },
      type: 'update' as const,
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          <htext suggestion_1={existingData} suggestion>
            te
            <anchor />
            st
            <focus />
          </htext>
        </hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);
    editor.update((tx) => tx.marks.add('italic', true));

    const dataList = getSuggestionApi(editor).dataList(
      editor.children[0].children[1] as any
    ) as TUpdateSuggestionData[];

    expect(dataList).toHaveLength(2);
    expect(dataList[0]).toEqual(existingData);
    expect(dataList[1].type).toBe('update');
    expect(dataList[1].newProperties).toEqual({ italic: true });
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
          <htext suggestion_1={existingData as any} suggestion>
            <anchor />
            test
            <focus />
          </htext>
        </hp>
      </editor>
    ) as any as BasePlateEditor;

    const editor = createBasePlateEditor({
      plugins: [suggestionPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);
    editor.update((tx) => tx.marks.add('bold', true));

    const node = editor.children[0].children[0] as any;

    expect(node.bold).toBeUndefined();
    expect(getSuggestionApi(editor).dataList(node)).toEqual([
      existingData,
    ] as any);
  });
});
