import {
  BaseParagraphPlugin,
  definePlugin,
  createEditorView,
  schema,
  SelectionApi,
  type Value,
} from '../../core';
import { BaseHeadingPlugin } from '../../features/basic-nodes/lib/BaseHeadingPlugins';
import {
  BaseTablePlugin,
  BaseTableRowPlugin,
  BaseTableCellPlugin,
} from '../../features/table';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { type AIChatDefinition, AIChatPlugin } from './AIChatPlugin';

const createEditor = (
  sendMessage: ReturnType<typeof mock>,
  initialValue: Value = [
    { children: [{ text: 'one' }], type: 'paragraph' },
    { children: [{ text: 'two' }], type: 'paragraph' },
  ],
  { markdown = false }: { markdown?: boolean } = {}
) => {
  const editor = createProductEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseAIPlugin,
      ...(markdown ? [MarkdownPlugin] : []),
      AIChatPlugin,
    ],
    userId: 'alice',
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue,
  });
  const chat = {
    clear: mock(),
    messages: [],
    regenerate: mock(async () => {}),
    sendMessage,
    status: 'ready' as const,
    stop: mock(),
  };

  editor.plugin(AIChatPlugin).store.set({ chat });

  return editor;
};

describe('AIChatPlugin submit', () => {
  it.each([
    { text: 'one', offset: 1, mode: 'chat', result: ['NEW', 'two'] },
    { text: 'one', offset: 3, mode: 'insert', result: ['one', 'NEW', 'two'] },
    { text: '', offset: 0, mode: 'insert', result: ['NEW', 'two'] },
  ] as const)(
    'captures $mode when show opens at offset $offset in "$text"',
    ({ text, offset, mode, result }) => {
      const sendMessage = mock();
      const editor = createEditor(sendMessage, [
        { type: 'paragraph', children: [{ text }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ]);
      const ai = editor.plugin(AIChatPlugin);
      editor.update.selection.set({ path: [0, 0], offset });

      ai.api.show();
      expect(editor.read.selection.nodes()).toHaveLength(
        mode === 'chat' ? 1 : 0
      );
      editor.update.selection.set({ path: [1, 0], offset: 3 });
      ai.api.submit('rewrite');

      expect(ai.store.get('mode')).toBe(mode);
      const request = sendMessage.mock.calls[0][1].body;
      expect(request.ctx.nodeSelection?.paths ?? []).toEqual(
        mode === 'chat' ? [[0]] : []
      );
      ai.api.setPreview('NEW');
      ai.api.accept();
      expect(
        editor.read
          .children()
          .map((_, index) => editor.read.text.string([index]))
      ).toEqual([...result]);
    }
  );

  it('does not retry or replace a deleted text target with its successor', () => {
    const editor = createEditor(mock());
    const ai = editor.plugin(AIChatPlugin);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    ai.api.submit('edit');
    const { regenerate } = ai.store.get('chat')!;
    editor.update.nodes.remove({ at: [0] });

    ai.api.reload();
    ai.api.setPreview('replacement');
    ai.api.accept();

    expect(regenerate).not.toHaveBeenCalled();
    expect(editor.read.text.string([])).toBe('two');
  });

  it.each(['accept', 'replaceSelection', 'insertBelow'] as const)(
    'applies %s to a backward text selection spanning paragraphs',
    async (action) => {
      const editor = createEditor(mock());
      const ai = editor.plugin(AIChatPlugin);
      editor.update.selection.set({
        anchor: { path: [1, 0], offset: 2 },
        focus: { path: [0, 0], offset: 1 },
      });
      ai.api.submit('edit');
      ai.api.setPreview('NEW');
      const before = structuredClone(editor.read.children());
      const historyDepth = editor.read.history().undos.length;

      ai.api[action]();

      expect(
        editor.read
          .children()
          .map((_, index) => editor.read.text.string([index]))
      ).toEqual(action === 'insertBelow' ? ['one', 'two', 'NEW'] : ['oNEWo']);
      expect(editor.read.history().undos).toHaveLength(historyDepth + 1);
      const after = structuredClone(editor.read.children());
      const appliedChanges = editor.read.authored.changes().items;
      expect(appliedChanges).toHaveLength(1);
      const appliedChange = appliedChanges[0]!;
      expect(appliedChange).toMatchObject({
        authorId: 'alice',
        status: 'accepted',
      });

      expect(await editor.api.history.undo()).toEqual({ status: 'applied' });
      expect(editor.read.children()).toEqual(before);
      expect(editor.read.history().undos).toHaveLength(historyDepth);
      // Undo restores content by adding a compensating authored change.
      expect(editor.read.authored.change(appliedChange.id)).toMatchObject({
        authorId: 'alice',
        id: appliedChange.id,
        status: 'accepted',
      });
      const undoChanges = editor.read.authored.changes().items;
      expect(undoChanges).toHaveLength(2);
      expect(undoChanges).toContainEqual(
        expect.objectContaining({
          authorId: 'alice',
          dependencies: [appliedChange.id],
          status: 'accepted',
        })
      );

      expect(await editor.api.history.redo()).toEqual({ status: 'applied' });
      expect(editor.read.children()).toEqual(after);
      expect(editor.read.history().undos).toHaveLength(historyDepth + 1);
      expect(editor.read.authored.change(appliedChange.id)).toMatchObject({
        authorId: 'alice',
        id: appliedChange.id,
        status: 'accepted',
      });
      expect(editor.read.authored.changes().items).toHaveLength(3);
    }
  );

  it.each(['accept', 'insertBelow'] as const)(
    'keeps exact backward node targets through retry and %s',
    (action) => {
      const editor = createEditor(mock(), [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'gap' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ]);
      const ai = editor.plugin(AIChatPlugin);
      editor.update.selection.set(
        SelectionApi.nodes([[0], [2]], {
          anchorPath: [2],
          focusPath: [0],
        })
      );
      ai.api.submit('edit');
      ai.api.reload();
      ai.api.setPreview('NEW');
      ai.api[action]();
      expect(
        editor.read
          .children()
          .map((_, index) => editor.read.text.string([index]))
      ).toEqual(
        action === 'insertBelow' ? ['one', 'gap', 'two', 'NEW'] : ['NEW', 'gap']
      );
    }
  );

  it('submits and replaces the captured node after its path changes', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const ai = editor.plugin(AIChatPlugin);
    editor.update.selection.set(SelectionApi.nodes([[1]]));
    ai.api.show();
    editor.update.nodes.insert(
      { type: 'paragraph', children: [{ text: 'before' }] },
      { at: [0] }
    );
    editor.update.selection.set(SelectionApi.nodes([[0]]));

    ai.api.submit('edit');
    expect(sendMessage).toHaveBeenCalledWith(
      'edit',
      expect.objectContaining({
        body: {
          ctx: expect.objectContaining({
            nodeSelection: { anchorPath: [2], focusPath: [2], paths: [[2]] },
            refs: { blocks: [{ path: [2], ref: 'b1' }], tableCells: [] },
          }),
        },
      })
    );
    ai.api.setPreview('NEW');
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('beforeoneNEW');
  });

  it('uses the captured text target for prompt callbacks and placeholders', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const ai = editor.plugin(AIChatPlugin);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    ai.api.show();
    editor.update.selection.set({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    });
    ai.api.submit('edit', {
      prompt: ({ editor: promptEditor }) => {
        expect(promptEditor.read.selection()?.anchor.path).toEqual([0, 0]);
        return '{block}/{nodeSelection}/{prompt}';
      },
    });
    expect(sendMessage.mock.calls[0][0]).toBe('one\n/one\n/edit');
    ai.api.setPreview('NEW');
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('NEWtwo');
  });

  it('keeps table response targets while serializing a preset prompt', () => {
    const sendMessage = mock();
    const editor = createProductEditor({
      plugins: [
        BaseParagraphPlugin,
        AIChatPlugin,
        BaseTablePlugin,
        BaseTableRowPlugin,
        BaseTableCellPlugin,
      ],
      userId: 'alice',
      initialValue: [
        {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: ['one', 'two'].map((text) => ({
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text }] }],
              })),
            },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0, 0], offset: 3 },
      },
    });
    const ai = editor.plugin(AIChatPlugin);
    ai.store.set({
      chat: {
        clear: mock(),
        messages: [],
        regenerate: mock(async () => {}),
        sendMessage,
        status: 'ready',
        stop: mock(),
      },
    });
    ai.api.submit('edit', { prompt: '{block}: {prompt}' });
    const { ref } = sendMessage.mock.calls[0][1].body.ctx.refs.tableCells[0];
    editor.update.selection.set({
      anchor: { path: [0, 0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 0, 1, 0, 0], offset: 3 },
    });
    ai.read.markdown({ type: 'tableCellWithRef' });
    ai.api.setTablePreview({ content: 'NEW', ref });
    ai.api.accept();
    expect(editor.read.text.string([])).toBe('NEWtwo');
  });

  it('inherits the last selected block format when inserting below several blocks', () => {
    const editor = createProductEditor({
      plugins: [BaseParagraphPlugin, BaseHeadingPlugin, AIChatPlugin],
      userId: 'alice',
      initialValue: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'heading', level: 2, children: [{ text: 'two' }] },
      ],
      selection: SelectionApi.nodes([[0], [1]]),
    });
    const ai = editor.plugin(AIChatPlugin);
    ai.api.submit('generate');
    ai.api.setPreview('NEW\n\nSecond');
    ai.api.insertBelow();
    expect(editor.read.children().slice(2)).toEqual([
      { type: 'heading', level: 2, children: [{ text: 'NEW' }] },
      { type: 'paragraph', children: [{ text: 'Second' }] },
    ]);
  });

  it('returns early when both prompt and input are empty', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    editor.plugin(AIChatPlugin).api.submit('');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('resolves placeholders in preset prompts before sending', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage, undefined, { markdown: true });
    const block = editor.plugin(AIChatPlugin).read.markdown({ type: 'block' });

    editor.plugin(AIChatPlugin).api.submit('one sentence', {
      prompt: '<Block>\n{block}\n</Block>\n{prompt}',
    });

    expect(sendMessage).toHaveBeenCalledWith(
      `<Block>\n${block}\n</Block>\none sentence`,
      expect.anything()
    );
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

  it('preserves accepted content, stores selected blocks, and sends context', () => {
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const selectedNodeKeys = new Set([editor.key([0])!, editor.key([1])!]);
    editor.update.selection.set(
      SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      })
    );
    editor.update.nodes.insert({ text: ' ai' }, { at: [0, 1] });
    editor.plugin(AIChatPlugin).api.show();
    editor.plugin(AIChatPlugin).store.set({ toolName: 'edit' });

    editor.plugin(AIChatPlugin).api.submit('draft', { mode: 'insert' });

    expect(editor.read.text.string([])).toBe('one aitwo');
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

  it('regenerates a submitted request before a preview has been applied', () => {
    const regenerate = mock(async () => {});
    const sendMessage = mock();
    const editor = createEditor(sendMessage);
    const chat = {
      messages: [],
      regenerate,
      sendMessage,
    } as unknown as NonNullable<AIChatDefinition['initialState']['chat']>;
    const selection = editor.read.selection();
    const children = editor.read.children();

    editor.plugin(AIChatPlugin).store.set({ chat });
    editor.plugin(AIChatPlugin).api.submit('draft', { mode: 'insert' });
    editor.plugin(AIChatPlugin).api.reload();

    expect(regenerate).toHaveBeenCalledTimes(1);
    expect(regenerate).toHaveBeenCalledWith({
      body: {
        ctx: expect.objectContaining({ selection }),
      },
    });
    expect(editor.read.children()).toEqual(children);
    expect(editor.read.selection()).toEqual(selection);
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
    const RootHolderPlugin = definePlugin('aiRootHolder', {
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
      userId: 'alice',
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
