import {
  BaseParagraphPlugin,
  defineBasePlugin,
  createEditorView,
  schema,
  SelectionApi,
  type Value,
} from '../../core';
import { createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const createEditor = (
  sendMessage: ReturnType<typeof mock>,
  initialValue: Value = [
    { children: [{ text: 'one' }], type: 'paragraph' },
    { children: [{ text: 'two' }], type: 'paragraph' },
  ]
) => {
  const editor = createProductEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin],
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

  it('defaults an empty node selection to chat mode', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage, [
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ]);

    editor.update.selection.set(SelectionApi.nodes([[0]]));

    editor.plugin(AIChatPlugin).api.submit('draft');

    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('chat');
    expect(editor.plugin(AIChatPlugin).store.get('chatSelection')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          ctx: expect.objectContaining({
            nodeSelection: {
              anchorPath: [0],
              focusPath: [0],
              paths: [[0]],
            },
            selection: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 0, path: [0, 0] },
            },
          }),
        }),
      })
    );
  });

  it('undoes insert mode, stores selected blocks, and sends their context', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const selectedNodeKeys = new Set([editor.key([0])!, editor.key([1])!]);
    editor.plugin(AIChatPlugin).store.set({ toolName: 'edit' });
    editor.plugin(AIChatPlugin).store.set({ open: true });
    editor.update.selection.set(
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
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
    ).toEqual([...selectedNodeKeys]);
    expect(editor.plugin(AIChatPlugin).store.get('chatSelection')).toBeNull();
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          ctx: expect.objectContaining({
            nodeSelection: {
              anchorPath: [1],
              focusPath: [0],
              paths: [[0], [1]],
            },
            refs: {
              blocks: [
                { path: [0], ref: 'b1' },
                { path: [1], ref: 'b2' },
              ],
              tableCells: [],
            },
            selection: {
              anchor: { offset: 3, path: [1, 0] },
              focus: { offset: 0, path: [0, 0] },
            },
            toolName: 'edit',
          }),
        }),
      })
    );
  });

  it('preserves backward node selection when regenerating', () => {
    const regenerate = mock(async () => {});
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const chat = {
      messages: [],
      regenerate,
      sendMessage,
    } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;

    editor.plugin(AIChatPlugin).store.set({ chat });
    editor.update.selection.set(
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
    editor.plugin(AIChatPlugin).api.submit('draft');
    editor.plugin(BaseAIPlugin).update.beginPreview();

    editor.plugin(AIChatPlugin).api.reload();

    expect(regenerate).toHaveBeenCalledWith({
      body: {
        ctx: expect.objectContaining({
          nodeSelection: {
            anchorPath: [1],
            focusPath: [0],
            paths: [[0], [1]],
          },
        }),
      },
    });
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
    const editor = createProductEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        AIChatPlugin,
        RootHolderPlugin,
      ],
      selection: SelectionApi.nodes([[0]], { root: 'header' }),
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
            nodeSelection: {
              anchorPath: [0],
              focusPath: [0],
              paths: [[0]],
            },
            refs: {
              blocks: [{ path: [0], ref: 'b1' }],
              tableCells: [],
            },
            selection: {
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
