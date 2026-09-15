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
    plugins: [BaseParagraphPlugin, BaseAIPlugin, MarkdownPlugin, AIChatPlugin],
    userId: 'alice',
    selection,
    initialValue: value,
  });

  editor.api.authored.setView({
    intent: 'propose',
    projection: 'markup',
  });

  editor.plugin(AIChatPlugin).store.set({
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
      ai.update.applySuggestions(content);
    }
    ai.update.accept();

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

    ai.update.applySuggestions('new');
    ai.update.applySuggestions('new text');
    const result = ai.update.rejectSuggestions();

    expect(result?.status).toBe('applied');
    expect(editor.read.value().children).toEqual(before.children);
    expect(editor.read.text.string([])).toBe('oldtail');
    expect(editor.key([1])).toBe(tailKey);
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

    ai.update.applySuggestions('new');
    Reflect.set(editor.runtime, 'userId', 'bob');
    editor.api.authored.setView({
      intent: 'edit',
      projection: 'accepted',
    });
    editor.update.text.insert(' foreign', {
      at: { offset: 4, path: [1, 0] },
    });

    const result = ai.api.reset();

    expect(result?.status).toBe('applied');
    expect(editor.read.text.string([])).toBe('oldtail foreign');
    expect(editor.read.authored.changes({ status: 'pending' }).items).toEqual(
      []
    );
  });

  it('reports a dependent foreign proposal instead of erasing it on cancel', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    const ai = editor.plugin(AIChatPlugin);

    ai.update.applySuggestions('new');
    const aiChangeId = ai.store.get('_changeId');
    Reflect.set(editor.runtime, 'userId', 'bob');
    editor.update.text.insert('!', {
      at: { offset: 3, path: [0, 0] },
    });

    const result = ai.api.reset();

    expect(result?.status).toBe('blocked');
    if (result?.status !== 'blocked') throw new Error('Expected blocked reset');
    expect(result.ids).toEqual([aiChangeId]);
    expect(result.dependants).toHaveLength(1);
    expect(ai.store.get('_changeId')).toBe(aiChangeId);
    expect(editor.read.text.string([])).toBe('new!');
    expect(
      editor.read.authored.changes({ status: 'pending' }).items
    ).toHaveLength(2);
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

    ai.update.applySuggestions('new');
    editor.update.nodes.remove({ at: [0] });
    const before = editor.read.value();

    ai.update.applySuggestions('new text');

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.text.string([])).toBe('tail');
  });

  it('replaces multi-block chat nodes and persists their selection ids', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');

    const replacementIds = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

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
      .update.applySuggestions('next-a\n\nnext-b\n\nnext-c\n\nnext-d', {
        split: true,
      });
    editor.plugin(AIChatPlugin).update.insertBelow();

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

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.insertBelow();

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

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    editor.update.nodes.remove({ at: [1] });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.insertBelow();

    expect(editor.read.value()).toEqual(before);
  });

  it('aborts a streaming replacement when any target key is missing', () => {
    const chatNodes = [
      { children: [{ text: 'old-a' }], type: 'paragraph' },
      { children: [{ text: 'old-b' }], type: 'paragraph' },
    ];
    const editor = createEditor(structuredClone(chatNodes), chatNodes);

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');
    const [firstKey] = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

    if (!firstKey) throw new Error('Expected a replacement key');

    editor.update.nodes.remove({ at: firstKey });
    const before = editor.read.value();

    editor.plugin(AIChatPlugin).update.applySuggestions('later-a\n\nlater-b');

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

    editor.plugin(AIChatPlugin).update.applySuggestions('replacement');

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

    editor.plugin(AIChatPlugin).update.applySuggestions('next-a\n\nnext-b');

    const replacementKeys = editor
      .plugin(AIChatPlugin)
      .store.get('_replaceNodeKeys');

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

    aiChat.update.applySuggestions('next-a\n\nnext-b\n\nnext-c');

    expect(aiChat.store.get('_replaceNodeKeys')).toHaveLength(3);

    aiChat.update.applySuggestions('last-a\n\nlast-b\n\nlast-c\n\nlast-d');

    expect(aiChat.store.get('_replaceNodeKeys')).toHaveLength(4);
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

    editor.plugin(AIChatPlugin).update.applySuggestions('replacement');

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
    editor.plugin(AIChatPlugin).update.replaceSelection({ format: 'none' });

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
    editor.plugin(AIChatPlugin).update.replaceSelection({ format: 'none' });

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

  it('stores one native proposal and selects its replacement block', () => {
    const chatNodes = [{ children: [{ text: 'old' }], type: 'paragraph' }];
    const editor = createEditor(structuredClone(chatNodes), chatNodes, {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });

    editor.plugin(AIChatPlugin).update.applySuggestions('done');

    const changeId = editor.plugin(AIChatPlugin).store.get('_changeId');
    expect(changeId).not.toBeNull();
    expect(editor.read.authored.change(changeId!)).toMatchObject({
      authorId: 'alice',
      status: 'pending',
    });
    expect(editor.read.value().children).toEqual(chatNodes);
    expect(editor.read.text.string([])).toBe('done');
    expect(editor.read.selection.nodes()).toHaveLength(1);
  });
});
