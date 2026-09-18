import { DefaultAuthoredPlugin } from '../../authored';
import {
  BaseParagraphPlugin,
  definePlugin,
  createEditorView,
  type Element,
  schema,
  type TextSelection,
  type Value,
} from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const createEditor = (
  value: Value,
  chatNodes: Element[],
  selection: TextSelection | null = null
) => {
  const editor = createProductEditor({
    plugins: [
      DefaultAuthoredPlugin,
      BaseParagraphPlugin,
      BaseAIPlugin,
      MarkdownPlugin,
      AIChatPlugin,
    ],
    userId: 'alice',
    selection,
    initialValue: value,
  });

  editor.plugin(AIChatPlugin).store.set({
    mode: 'chat',
    chatSelection: selection,
    chatNodes: chatNodes.map((node, index) => ({
      node,
      nodeKey: editor.key([index])!,
    })),
  });

  return editor;
};

describe('AIChatPlugin suggestions', () => {
  it('accepts every streamed chunk when editing a single block', () => {
    const original = 'This sentence are badly write';
    const chatNodes = [{ children: [{ text: original }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: original.length, path: [0, 0] },
    });
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ mode: 'chat' });
    for (const content of [
      'This',
      'This sentence',
      'This sentence is poorly written.',
    ]) {
      ai.api.setPreview(content);
    }
    ai.api.accept();

    expect(editor.read.text.string([])).toBe(
      'This sentence is poorly written.'
    );
  });

  it('discards all streamed chunks without changing adjacent blocks', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes,
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }
    );
    const before = editor.read.value();
    const tailKey = editor.key([1]);
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('new');
    ai.api.setPreview('new text');
    ai.api.reset();

    expect(editor.read.value().children).toEqual(before.children);
    expect(editor.read.text.string([])).toBe('oldtail');
    expect(editor.key([1])).toBe(tailKey);
  });

  it('dismisses a selection draft without applying it', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ open: true });
    ai.api.setPreview('new');
    expect(ai.store.get('previewValue')).toHaveLength(1);

    ai.api.hide({ focus: false });

    expect(ai.store.get('open')).toBe(false);
    expect(ai.store.get('previewValue')).toEqual([]);
    expect(editor.read.text.string([])).toBe('old');
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(0);
  });

  it('cancels only the AI proposal and preserves an independent foreign edit', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes,
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('new');
    Reflect.set(editor.runtime, 'userId', 'bob');
    editor.api.authored.setView({
      intent: 'edit',
      projection: 'accepted',
    });
    editor.update.text.insert(' foreign', {
      at: { offset: 4, path: [1, 0] },
    });

    ai.api.reset();

    expect(editor.read.text.string([])).toBe('oldtail foreign');
    expect(editor.read.authored.changes({ status: 'pending' }).items).toEqual(
      []
    );
  });

  it('discards the draft without deciding another author’s suggestion', () => {
    const nodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(nodes), nodes);
    const ai = editor.plugin(AIChatPlugin);
    ai.api.setPreview('new');
    editor.api.authored.setView({ intent: 'propose', projection: 'markup' });
    editor.update.text.insert('!', { at: { offset: 3, path: [0, 0] } });
    const proposals = editor.read.authored.changes({ status: 'pending' }).items;
    ai.api.reset();
    expect(editor.read.authored.changes({ status: 'pending' }).items).toEqual(
      proposals
    );
    expect(editor.read.text.string([])).toBe('old!');
    expect(editor.read.authored.view()).toEqual({
      intent: 'propose',
      projection: 'markup',
    });
  });

  it('stops later chunks when a single-block preview target is deleted', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes,
      {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('new');
    editor.update.nodes.remove({ at: [0] });
    const before = editor.read.value();

    ai.api.setPreview('new text');

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.text.string([])).toBe('tail');
  });

  it('replaces multi-block chat nodes and persists their selection ids', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).api.setPreview('next-a\n\nnext-b');

    expect(editor.read.text.string([])).toBe('old-aold-b');
    editor.plugin(AIChatPlugin).api.accept();
    const replacementIds = editor.read.selection
      .nodes()
      .map(([node]) => editor.key(node));

    expect(replacementIds).toHaveLength(2);
    expect(
      editor.read.selection.nodes().map(([node]) => editor.key(node))
    ).toEqual([...replacementIds]);
    expect(replacementIds.every((id) => editor.read.nodes.path(id))).toBe(true);
    expect(editor.read.text.string([])).toContain('next-a');
    expect(editor.read.text.string([])).toContain('next-b');
  });

  it('inserts expanded AI edits after the restored block selection', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor
      .plugin(AIChatPlugin)
      .api.setPreview('next-a\n\nnext-b\n\nnext-c\n\nnext-d');
    const historyDepth = editor.read.history().undos.length;
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    editor.plugin(AIChatPlugin).api.insertBelow();
    unsubscribe();

    expect(commits).toBe(1);
    expect(editor.read.history().undos).toHaveLength(historyDepth + 1);
    expect(
      editor.read.children().map((_, index) => editor.read.text.string([index]))
    ).toEqual([
      'old-a',
      'old-b',
      'next-a',
      'next-b',
      'next-c',
      'next-d',
      'tail',
    ]);

    const completed = structuredClone(editor.read.children());

    expect(editor.api.history.undo()).toEqual({ status: 'applied' });
    expect(editor.read.text.string([])).toBe('old-aold-btail');
    expect(editor.api.history.redo()).toEqual({ status: 'applied' });
    expect(editor.read.children()).toEqual(completed);
  });

  it('replaces accepted content with proposal output as one reversible action', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('next-a\n\nnext-b');
    const historyDepth = editor.read.history().undos.length;
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    ai.api.replaceSelection({ format: 'none' });
    unsubscribe();

    expect(commits).toBe(1);
    expect(editor.read.history().undos).toHaveLength(historyDepth + 1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'next-a' }], type: 'paragraph' },
      { children: [{ text: 'next-b' }], type: 'paragraph' },
      { children: [{ text: 'tail' }], type: 'paragraph' },
    ]);

    const completed = structuredClone(editor.read.children());

    expect(editor.api.history.undo()).toEqual({ status: 'applied' });
    expect(editor.read.text.string([])).toBe('old-aold-btail');
    expect(editor.api.history.redo()).toEqual({ status: 'applied' });
    expect(editor.read.children()).toEqual(completed);
  });

  it('does not reuse a stale path when a chat source block is deleted', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.plugin(AIChatPlugin).api.setPreview('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(editor.read.value()).toEqual(before);
  });

  it('does not mistake an identical sibling for a deleted chat source', () => {
    const chatNodes = [
      { children: [{ text: 'same' }], type: 'paragraph' },
      { children: [{ text: 'same' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'same' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.plugin(AIChatPlugin).api.setPreview('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(editor.read.value()).toEqual(before);
  });

  it('aborts a streaming replacement when any target key is missing', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).api.setPreview('next-a\n\nnext-b');
    const firstKey = editor.key([0]);

    if (!firstKey) throw new Error('Expected a replacement key');

    editor.update.nodes.remove({ at: firstKey });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).api.setPreview('later-a\n\nlater-b');

    expect(editor.read.value()).toEqual(before);
  });

  it('aborts a single-block replacement when its source key is missing', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        { children: [{ text: 'tail' }], type: 'paragraph' },
      ],
      chatNodes
    );

    editor.update.nodes.remove({ at: [0] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).api.setPreview('replacement');

    expect(editor.read.value()).toEqual(before);
  });

  it('tracks only the blocks produced by its replacement groups', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(
      [
        ...structuredClone(chatNodes),
        {
          children: [{ text: 'unrelated' }],
          type: 'paragraph',
        },
      ],
      chatNodes
    );
    const unrelatedKey = editor.key([2])!;

    editor.plugin(AIChatPlugin).api.setPreview('next-a\n\nnext-b');

    editor.plugin(AIChatPlugin).api.accept();
    const replacementKeys = editor.read.selection
      .nodes()
      .map(([node]) => editor.key(node));

    expect(replacementKeys).toHaveLength(2);
    expect(replacementKeys).not.toContain(unrelatedKey);
    expect(
      editor.read.selection.nodes().map(([node]) => editor.key(node))
    ).toEqual([...replacementKeys]);
  });

  it('keeps streaming when the replacement block count changes', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);
    const aiChat = editor.plugin(AIChatPlugin);

    aiChat.api.setPreview('next-a\n\nnext-b\n\nnext-c');

    expect(aiChat.store.get('previewValue')).toHaveLength(3);

    aiChat.api.setPreview('last-a\n\nlast-b\n\nlast-c\n\nlast-d');

    expect(aiChat.store.get('previewValue')).toHaveLength(4);
    aiChat.api.accept();
    expect(
      editor.read
        .children()
        .map((_, index) =>
          editor.read.text
            .string([index])
            .endsWith(['last-a', 'last-b', 'last-c', 'last-d'][index])
        )
    ).toEqual([true, true, true, true]);
  });

  it('captures chat source identity in its named root', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
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
        MarkdownPlugin,
        AIChatPlugin,
        RootHolderPlugin,
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0], root: 'header' },
        focus: { offset: 5, path: [1, 0], root: 'header' },
        kind: 'text',
      },
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: 'aiRootHolder',
          },
        ],
        roots: { header: structuredClone(chatNodes) },
      },
      userId: 'alice',
    });
    editor.plugin(AIChatPlugin).api.submit('edit');

    const snapshots = editor.plugin(AIChatPlugin).store.get('chatNodes');

    expect(snapshots.map(({ root }) => root)).toEqual(['header', 'header']);
    expect(
      snapshots.map(({ nodeKey }) => editor.read.nodes.get(nodeKey)?.[0])
    ).toEqual([...editor.read.root('header')]);

    const before = editor.read.value();

    editor.plugin(AIChatPlugin).api.setPreview('replacement');

    expect(editor.read.value()).toEqual(before);
  });

  it('replaces named-root chat blocks without touching the main document', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const RootHolderPlugin = definePlugin('aiReplacementRootHolder', {
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
    const main = {
      childRoots: { body: 'header' },
      children: [{ text: '' }],
      type: 'aiReplacementRootHolder',
    };
    const mainChildren = [
      main,
      { children: [{ text: '' }], type: 'paragraph' },
    ];
    const editor = createProductEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseAIPlugin,
        MarkdownPlugin,
        AIChatPlugin,
        RootHolderPlugin,
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0], root: 'header' },
        focus: { offset: 5, path: [1, 0], root: 'header' },
        kind: 'text',
      },
      initialValue: {
        children: structuredClone(mainChildren),
        roots: { header: structuredClone(chatNodes) },
      },
      userId: 'alice',
    });
    const header = createEditorView(editor, { root: 'header' });

    header.update.selection.setNodes([[0], [1]]);

    editor.plugin(AIChatPlugin).store.set({
      chatNodes: chatNodes.map((node, index) => ({
        node,
        nodeKey: header.key([index])!,
        root: 'header',
      })),
      previewValue: [{ children: [{ text: 'new' }], type: 'paragraph' }],
    });
    editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    expect(editor.read.children()).toEqual(mainChildren);
    expect(header.read.children()).toEqual([
      { children: [{ text: 'new' }], type: 'paragraph' },
    ]);
  });

  it('replaces the selection from the owned preview value', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
      kind: 'text',
    });

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'new' }], type: 'paragraph' }],
    });
    editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    expect(editor.read.text.string([])).toBe('new');
  });

  it('clears stale preview content before submitting another request', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).store.set({
      previewValue: [{ children: [{ text: 'stale' }], type: 'paragraph' }],
    });
    editor.plugin(AIChatPlugin).api.submit('continue');

    expect(editor.plugin(AIChatPlugin).store.get('previewValue')).toEqual([]);
  });

  it('maps a text replacement past an intervening block insertion', () => {
    const nodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(nodes), nodes, {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    const ai = editor.plugin(AIChatPlugin);
    ai.api.setPreview('replacement');
    editor.update.nodes.insert(
      { type: 'paragraph', children: [{ text: 'independent' }] },
      { at: [0] }
    );
    ai.api.accept();
    expect(
      editor.read.children().map((_, index) => editor.read.text.string([index]))
    ).toEqual(['independent', 'replacement']);
    editor.api.history.undo();
    expect(editor.read.text.string([])).toBe('independentold');
  });

  it('creates tracked edits only when the user explicitly chooses suggesting', () => {
    const nodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(nodes), nodes);
    const ai = editor.plugin(AIChatPlugin);
    editor.api.authored.setView({ intent: 'propose', projection: 'markup' });
    ai.api.setPreview('done');
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(0);
    ai.api.accept();
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(1);
    expect(editor.read.value().children).toEqual(nodes);
    expect(editor.read.text.string([])).toBe('done');
    expect(editor.read.authored.view()).toEqual({
      intent: 'propose',
      projection: 'markup',
    });
  });
});
