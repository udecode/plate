import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import {
  createEditor as createPliteEditor,
  createEditorView,
  schema,
  type Value,
} from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const createEditor = (sendMessage: ReturnType<typeof mock>) => {
  const initialValue: Value = [
    { children: [{ text: 'one' }], type: 'paragraph' },
    { children: [{ text: 'two' }], type: 'paragraph' },
  ];
  const editor = createPlateEditor({
    editor: createPliteEditor<Value>(),
    plugins: [
      BaseParagraphPlugin,
      BaseAIPlugin,
      BlockSelectionPlugin,
      AIChatPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue,
  });
  const chat = {
    messages: [],
    sendMessage,
  } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

  editor.plugin(AIChatPlugin).store.set({ chat });

  return editor;
};

describe('AIChatPlugin submit', () => {
  it('returns early when both prompt and input are empty', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    editor.plugin(AIChatPlugin).api.submit('');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('undoes insert mode, stores selected blocks, and sends their context', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const selectedKeys = new Set([editor.key([0])!, editor.key([1])!]);
    editor.plugin(AIChatPlugin).store.set({ toolName: 'edit' });
    editor.plugin(AIChatPlugin).store.set({ open: true });
    editor.plugin(BlockSelectionPlugin).store.set({ selectedKeys });
    editor.update({ history: 'merge' }, (tx) => {
      tx.ai.markBatch();
      tx.nodes.insert({ ai: true, text: ' ai' }, { at: [0, 1] });
    });

    editor.plugin(AIChatPlugin).api.submit('draft', { mode: 'insert' });

    expect(editor.read.text.string([])).toBe('onetwo');
    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).store.get('toolName')).toBe('edit');
    expect(
      editor
        .plugin(AIChatPlugin)
        .store.get('chatNodes')
        .map(({ nodeKey }) => nodeKey)
    ).toEqual([...selectedKeys]);
    expect(editor.plugin(AIChatPlugin).store.get('chatSelection')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          ctx: expect.objectContaining({
            refs: {
              blocks: [
                { path: [0], ref: 'b1' },
                { path: [1], ref: 'b2' },
              ],
              tableCells: [],
            },
            selection: expect.any(Object),
            toolName: 'edit',
          }),
        }),
      })
    );
  });

  it('localizes named-root request context while retaining local key ownership', () => {
    const sendMessage = mock();
    const RootHolderPlugin = defineBasePlugin('aiRootHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createPlateEditor({
      editor: createPliteEditor<Value>(),
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        BlockSelectionPlugin,
        AIChatPlugin,
        RootHolderPlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0], root: 'header' },
        focus: { offset: 3, path: [0, 0], root: 'header' },
      },
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'aiRootHolder',
          },
        ],
        roots: {
          header: [{ children: [{ text: 'one' }], type: 'paragraph' }],
        },
      },
    });
    const chat = {
      messages: [],
      sendMessage,
    } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

    editor.plugin(AIChatPlugin).store.set({ chat });
    editor.plugin(AIChatPlugin).api.submit('review', { toolName: 'comment' });

    expect(sendMessage).toHaveBeenCalledWith(
      'review',
      expect.objectContaining({
        body: expect.objectContaining({
          ctx: expect.objectContaining({
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            refs: {
              blocks: [{ path: [0], ref: 'b1' }],
              tableCells: [],
            },
            selection: {
              kind: 'text',
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 3, path: [0, 0] },
            },
          }),
        }),
      })
    );

    const blockRef = editor.plugin(AIChatPlugin).store.get('_blockRefs').b1;
    const headerKey = createEditorView(editor, { root: 'header' }).key([0]);

    if (!headerKey) throw new Error('Expected a named-root block key');

    expect(blockRef).toEqual({
      key: headerKey,
      root: 'header',
    });
  });
});
