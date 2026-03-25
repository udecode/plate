/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { rejectSuggestion } from './rejectSuggestion';

jsxt;

const suggestionPlugin = BaseSuggestionPlugin.configure({
  options: {
    currentUserId: 'testId',
  },
});

describe('rejectSuggestion', () => {
  it('reject insert suggestion', () => {
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
        <hp>testtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('reject remove suggestion', () => {
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
        <hp>testremovedtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('reject update suggestion', () => {
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
        <hp>testupdatedtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('restores falsy removed properties from update suggestions', () => {
    const updateData = {
      createdAt: Date.now(),
      id: '1',
      properties: {
        italic: false,
      },
      type: 'update',
      userId: 'testId',
    };

    const input = (
      <editor>
        <hp>
          test
          <htext suggestion_1={updateData} suggestion>
            updated
          </htext>
          text
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual([
      {
        children: [
          { text: 'test' },
          { italic: true, text: 'updated' },
          { text: 'text' },
        ],
        type: 'p',
      },
    ]);
  });

  it('reject line break suggestion', () => {
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
        <hp>test1test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('merge nodes when rejecting line break insert suggestion', () => {
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
        <hp>test1test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('reject node with both remove and insert suggestions', () => {
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
        <hp>testremovedtext</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    // Reject should keep the remove suggestion and remove the insert suggestion
    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('reject remove nodes', () => {
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
        <hp>test1</hp>
        <hp>test2</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });

  it('reject insert nodes', () => {
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
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [suggestionPlugin],
      value: input.children,
    });

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });
});
