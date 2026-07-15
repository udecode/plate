import { MarkdownPlugin } from '@platejs/markdown';
import {
  getSuggestionKey,
  getTransientSuggestionKey,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type TTableElement, KEYS } from '@platejs/utils';
import { type Value } from '@platejs/plite';
import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import {
  beginAIPreview,
  hasAIPreview,
} from '../../../lib/transforms/aiStreamSnapshot';
import { aiBatchField, withAIBatch } from '../../../lib/transforms/withAIBatch';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { acceptAISuggestions } from './acceptAISuggestions';
import { applyTableCellSuggestion } from './applyTableCellSuggestion';
import {
  getTableCellChildren,
  isSingleCellTable,
} from './nestedContainerUtils';
import { rejectAISuggestions } from './rejectAISuggestions';
import { resetAIChat } from './resetAIChat';

const TablePlugin = createPlatePlugin({
  key: KEYS.table,
  node: { isContainer: true, isElement: true },
});
const TableRowPlugin = createPlatePlugin({
  key: KEYS.tr,
  node: { isElement: true },
});
const TableCellPlugin = createPlatePlugin({
  key: KEYS.td,
  node: { isElement: true },
});

const createSuggestionEditor = (type: 'insert' | 'remove') => {
  const transientKey = getTransientSuggestionKey();
  const suggestionKey = getSuggestionKey('s1');

  return createPlateEditor<Value>({
    plugins: [
      BaseParagraphPlugin,
      SuggestionPlugin.configure({ options: { currentUserId: 'u1' } }),
    ],
    value: [
      {
        children: [
          {
            [suggestionKey]: {
              createdAt: '2024-01-01T00:00:00.000Z',
              id: 's1',
              type,
              userId: 'u1',
            },
            [KEYS.suggestion]: true,
            [transientKey]: true,
            text: 'suggested',
          },
        ],
        type: 'p',
      },
    ],
  });
};

describe('ai chat action utils', () => {
  it('diffs a table cell update and replaces only its children', () => {
    const editor = createPlateEditor<Value>({
      plugins: [
        BaseParagraphPlugin,
        MarkdownPlugin,
        SuggestionPlugin.configure({ options: { currentUserId: 'u1' } }),
        TablePlugin,
        TableRowPlugin,
        TableCellPlugin,
      ],
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'old' }], type: 'p' }],
                  id: 'cell-1',
                  type: KEYS.td,
                },
              ],
              type: KEYS.tr,
            },
          ],
          type: KEYS.table,
        },
      ],
    });

    applyTableCellSuggestion(editor, { content: 'ai', id: 'cell-1' });

    expect(
      editor.read.nodes.some({
        at: [],
        match: (node) =>
          Boolean(Reflect.get(node, getTransientSuggestionKey())),
      })
    ).toBe(true);
    expect(editor.read.text.string([])).toContain('ai');
    expect(editor.read.history.undos()[0]?.statePatches).toContainEqual(
      expect.objectContaining({ key: aiBatchField.key })
    );
  });

  it('accepts transient insert suggestions and clears their metadata', () => {
    const editor = createSuggestionEditor('insert');

    acceptAISuggestions(editor);

    expect(editor.read.text.string([])).toBe('suggested');
    expect(
      editor.read.nodes.some({
        at: [],
        match: (node) =>
          Boolean(Reflect.get(node, getTransientSuggestionKey())),
      })
    ).toBe(false);
  });

  it('rejects transient insert suggestions and clears their content', () => {
    const editor = createSuggestionEditor('insert');

    rejectAISuggestions(editor);

    expect(editor.read.text.string([])).toBe('');
  });

  it('stops chat, resets options, and undoes the active AI batch', () => {
    const stop = mock();
    const setMessages = mock();
    const editor = createPlateEditor<Value>({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
      value: [{ children: [{ text: '' }], type: 'p' }],
    });
    const chat = {
      messages: [
        {
          id: 'm1',
          parts: [{ text: 'answer', type: 'text' }],
          role: 'assistant',
        },
      ],
      setMessages,
      stop,
    } as unknown as NonNullable<AIChatPluginConfig['options']['chat']>;
    editor.plugin(AIChatPlugin).setOptions({
      _replaceIds: ['block'],
      chat,
      chatNodes: [{ children: [{ text: '' }], id: 'block', type: 'p' }],
      mode: 'chat',
      toolName: 'edit',
      open: true,
    });
    withAIBatch(editor, (tx) => {
      tx.nodes.insert({ ai: true, text: 'ai' }, { at: [0, 1] });
    });

    resetAIChat(editor);

    expect(stop).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalledWith([]);
    expect(editor.read.text.string([])).toBe('');
    expect(editor.plugin(AIChatPlugin).getOption('_replaceIds')).toEqual([]);
    expect(editor.plugin(AIChatPlugin).getOption('chatNodes')).toEqual([]);
    expect(editor.plugin(AIChatPlugin).getOption('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).getOption('toolName')).toBeNull();
  });

  it('discards preview bookkeeping when reset skips undo', () => {
    const editor = createPlateEditor<Value>({
      plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
    });

    beginAIPreview(editor);
    resetAIChat(editor, { undo: false });

    expect(hasAIPreview(editor)).toBe(false);
  });

  it('detects single-cell tables and extracts their cell children', () => {
    const table = {
      children: [
        {
          children: [
            {
              children: [{ text: 'x' }],
              type: KEYS.td,
            },
          ],
          type: KEYS.tr,
        },
      ],
      type: KEYS.table,
    } satisfies TTableElement;

    expect(isSingleCellTable([table])).toBe(true);
    expect(getTableCellChildren(table)).toEqual([{ text: 'x' }]);
    expect(
      isSingleCellTable([{ children: [{ text: '' }], type: KEYS.p }])
    ).toBe(false);
  });
});
