/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

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

describe('editor.update.suggestion.accept', () => {
  it('accept insert suggestion', () => {
    const insertData = {
      id: '1',
      createdAt: Date.now(),
      type: 'insert',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          test
          <htext suggestion_1={insertData} suggestion>
            inserted
          </htext>
          text
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>testinsertedtext</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BoldPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('accept remove suggestion', () => {
    const removeData = {
      id: '1',
      createdAt: Date.now(),
      type: 'remove',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          test
          <htext suggestion_1={removeData} suggestion>
            removed
          </htext>
          text
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>testtext</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('accept update suggestion', () => {
    const updateData = {
      id: '1',
      createdAt: Date.now(),
      newProperties: {
        bold: true,
      },
      type: 'update',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          test
          <htext suggestion_1={updateData} bold suggestion>
            updated
          </htext>
          text
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          test
          <htext bold>updated</htext>
          text
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin, BoldPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('accept line break suggestion', () => {
    const lineBreakData = {
      id: '1',
      createdAt: Date.now(),
      isLineBreak: true,
      type: 'insert',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp suggestion={lineBreakData}>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('merge nodes when accepting line break remove suggestion', () => {
    const lineBreakData = {
      id: '1',
      createdAt: Date.now(),
      isLineBreak: true,
      type: 'remove',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp suggestion={lineBreakData}>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test1test2</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('merges paragraphs after deleteBackward creates a remove line break suggestion', () => {
    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { type: 'p', children: [{ text: 'test1' }] },
        { type: 'p', children: [{ text: 'test2' }] },
      ],
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteBackward({ unit: 'character' });

    const lineBreakData = (editor.read.children()[0] as any).suggestion;

    editor.update.suggestion.accept({
      keyId: editor.plugin(BaseSuggestionPlugin).api.key(lineBreakData.id),
      suggestionId: lineBreakData.id,
    } as any);

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hp>test1test2</hp>
        </editor>
      ).children
    );
  });

  it('accept node with both remove and insert suggestions', () => {
    const time = Date.now();

    const removeData = {
      id: '1',
      createdAt: time,
      type: 'remove',
      userId: 'testId',
    };

    const insertData = {
      id: '1',
      createdAt: time,
      type: 'insert',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          test
          <htext suggestion_1={removeData} suggestion>
            removed
          </htext>
          <htext suggestion_1={insertData} suggestion>
            inserted
          </htext>
          text
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>testinsertedtext</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    // Accept should replace the remove suggestion with the insert suggestion
    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('accept remove nodes', () => {
    const removeData = {
      id: '1',
      createdAt: Date.now(),
      type: 'remove',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp suggestion={removeData}>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test2</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('accept insert nodes', () => {
    const insertData = {
      id: '1',
      createdAt: Date.now(),
      type: 'insert',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>test1</hp>
        <hp suggestion={insertData}>test2</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [suggestionPlugin],
      initialValue: input.children,
    });

    editor.update.suggestion.accept({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });
});
