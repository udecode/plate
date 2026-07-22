/** @jsx jsxt */

import { type TUpdateSuggestionData } from '@platejs/utils';

import { jsxt } from '@platejs/test-utils';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getInlineSuggestionData } from '../utils';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

const BoldPlugin = createBasePlugin({
  key: 'bold',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

const ItalicPlugin = createBasePlugin({
  key: 'italic',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
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
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.marks.add('bold', true);

    const data = getInlineSuggestionData(
      editor.read.children()[0].children[0] as any
    ) as TUpdateSuggestionData;

    expect(editor.read.children()[0].children[0].bold).toBe(true);
    expect(
      editor.read.children()[0].children[0][BaseSuggestionPlugin.key]
    ).toBe(true);
    expect(data).toBeDefined();
    expect(data?.type).toBe('update');
    expect(data?.userId).toBe('testId');
    expect(data?.newProperties).toEqual({ bold: true });
    expect(typeof data?.createdAt).toBe('number');
    expect(typeof data?.id).toBe('string');
  });

  it('tracks a mark added through the semantic toggle command', () => {
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
      plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.marks.toggle('bold', true);

    const node = editor.read.children()[0].children[0] as any;
    const data = getInlineSuggestionData(node) as TUpdateSuggestionData;

    expect(node.bold).toBe(true);
    expect(data.newProperties).toEqual({ bold: true });
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
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.marks.add('italic', true);

    const dataList = editor
      .plugin(BaseSuggestionPlugin)
      .api.dataList(
        editor.read.children()[0].children[1] as any
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
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
    editor.update.marks.add('bold', true);

    const node = editor.read.children()[0].children[0] as any;

    expect(node.bold).toBeUndefined();
    expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
      existingData,
    ] as any);
  });
});
