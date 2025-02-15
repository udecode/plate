/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate';

import { createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { acceptSuggestion } from './acceptSuggestion';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('acceptSuggestion', () => {
  it('should accept insert suggestion', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>testinsertedtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should accept remove suggestion', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>testtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should accept update suggestion', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          test
          <htext bold>updated</htext>
          text
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should accept line break suggestion', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should merge nodes when accepting line break remove suggestion', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>test1test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });
  it('should accept node with both remove and insert suggestions', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>testinsertedtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    // Accept should replace the remove suggestion with the insert suggestion
    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should accept remove nodes', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('should accept insert nodes', () => {
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    acceptSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });
});
