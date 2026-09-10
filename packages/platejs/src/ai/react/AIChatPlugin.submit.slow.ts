import {
  BaseParagraphPlugin,
  defineBasePlugin,
  createEditorView,
  schema,
  SelectionApi,
  type Value,
} from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatAdapter, AIChatPlugin } from './AIChatPlugin';

const createChat = (
  sendMessage: ReturnType<typeof mock>,
  regenerate = mock(async () => {})
) =>
  ({
    messages: [],
    status: 'ready' as const,
    sendMessage,
    regenerate,
    stop: mock(),
    clear: mock(),
  }) satisfies AIChatAdapter;

const createEditor = (
  sendMessage: ReturnType<typeof mock>,
  initialValue: Value = [
    { children: [{ text: 'one' }], type: 'paragraph' },
    { children: [{ text: 'two' }], type: 'paragraph' },
  ]
) => {
  const editor = createProductEditor({
    plugins: [BaseParagraphPlugin, BaseAIPlugin, AIChatPlugin, MarkdownPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue,
  });
  const chat = createChat(sendMessage);

  editor.plugin(AIChatPlugin).store.set({ chat });

  return editor;
};

describe('AIChatPlugin submit', () => {
  it('returns early when both prompt and input are empty', () => {
    const sendMessage = mock(async () => {});
    const editor = createEditor(sendMessage);
    editor.plugin(AIChatPlugin).api.submit('');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('defaults an empty node selection to chat mode', () => {
    const sendMessage = mock(async () => {});
    const editor = createEditor(sendMessage, [
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ]);

    editor.update.selection.set(SelectionApi.nodes([[0]]));

    editor.plugin(AIChatPlugin).api.submit('draft');

    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('chat');
    const target = editor.key([0]);
    if (!target) throw new Error('Expected a selected block key.');
    expect(editor.plugin(AIChatPlugin).store.get('operation')?.targets).toEqual(
      [target]
    );
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          requestId: editor.plugin(AIChatPlugin).store.get('operation')?.id,
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

  it('replaces a detached operation and sends backward selected block context', () => {
    const sendMessage = mock(async () => {});
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
    const ai = editor.plugin(AIChatPlugin);
    const initial = editor.read.value();
    const initialSelection = editor.read.selection();
    const previousId = ai.api.start({ mode: 'insert', toolName: 'generate' });
    ai.api.receive(previousId, 'unaccepted draft');
    ai.store.set({ toolName: 'edit' });
    const requestId = ai.api.submit('draft', { mode: 'insert' });
    expect(requestId).not.toBe(previousId);
    expect(ai.store.get('operation')).toMatchObject({
      id: requestId,
      source: '',
      status: 'streaming',
      targets: [...selectedNodeKeys],
    });
    expect(editor.read.value()).toEqual(initial);
    expect(editor.read.selection()).toEqual(initialSelection);
    expect(editor.read.history.undos()).toHaveLength(0);

    expect(editor.read.text.string([])).toBe('onetwo');
    expect(editor.plugin(AIChatPlugin).store.get('mode')).toBe('insert');
    expect(editor.plugin(AIChatPlugin).store.get('toolName')).toBe('edit');
    expect(sendMessage).toHaveBeenCalledWith(
      'draft',
      expect.objectContaining({
        body: expect.objectContaining({
          requestId: editor.plugin(AIChatPlugin).store.get('operation')?.id,
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
    const sendMessage = mock(async () => {});
    const editor = createEditor(sendMessage);
    const chat = createChat(sendMessage, regenerate);

    editor.plugin(AIChatPlugin).store.set({ chat });
    editor.update.selection.set(
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
    const ai = editor.plugin(AIChatPlugin);
    const requestId = ai.api.submit('draft');
    const targets = ai.store.get('operation')?.targets;
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    const beforeRetry = editor.read.value();
    const selectionBeforeRetry = editor.read.selection();
    const retryId = ai.api.retry();
    expect(editor.read.value()).toEqual(beforeRetry);
    expect(editor.read.selection()).toEqual(selectionBeforeRetry);
    expect(editor.read.history.undos()).toHaveLength(0);
    expect(retryId).not.toBe(requestId);
    expect(ai.store.get('operation')).toMatchObject({
      id: retryId,
      targets,
      source: '',
      status: 'streaming',
    });

    expect(regenerate).toHaveBeenCalledWith({
      body: {
        requestId: retryId,
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

  it('preserves backward discrete targets without including intervening blocks', () => {
    const sendMessage = mock(async () => {});
    const editor = createEditor(
      sendMessage,
      ['one', 'middle', 'three'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      }))
    );
    editor.update.selection.set(
      SelectionApi.nodes([[0], [2]], { anchorPath: [2], focusPath: [0] })
    );
    const ai = editor.plugin(AIChatPlugin);
    const id = ai.api.submit('review');
    expect(ai.store.get('operation')).toMatchObject({
      id,
      targets: [editor.key([0]), editor.key([2])],
    });
    expect(sendMessage).toHaveBeenCalledWith(
      'review',
      expect.objectContaining({
        body: expect.objectContaining({
          requestId: id,
          ctx: expect.objectContaining({
            nodeSelection: {
              anchorPath: [2],
              focusPath: [0],
              paths: [[0], [2]],
            },
            selection: {
              anchor: { offset: 5, path: [2, 0] },
              focus: { offset: 0, path: [0, 0] },
            },
          }),
        }),
      })
    );
  });

  it('localizes named-root request context while retaining local key ownership', () => {
    const sendMessage = mock(async () => {});
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
    const chat = createChat(sendMessage);

    editor.plugin(AIChatPlugin).store.set({ chat });
    editor.plugin(AIChatPlugin).api.submit('review', { toolName: 'comment' });

    expect(sendMessage).toHaveBeenCalledWith(
      'review',
      expect.objectContaining({
        body: expect.objectContaining({
          requestId: editor.plugin(AIChatPlugin).store.get('operation')?.id,
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

    const headerKey = createEditorView(editor, { root: 'header' }).key([0]);

    if (!headerKey) throw new Error('Expected a named-root block key');

    expect(editor.plugin(AIChatPlugin).store.get('operation')).toMatchObject({
      root: 'header',
      targets: [headerKey],
    });
  });
});
