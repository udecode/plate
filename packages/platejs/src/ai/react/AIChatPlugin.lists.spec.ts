import remarkGfm from 'remark-gfm';

import { AuthoredPlugin } from '../../authored';
import {
  BaseParagraphPlugin,
  definePlugin,
  NodeApi,
  schema,
  type TextSelection,
  type Value,
} from '../../core';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseUnderlinePlugin,
} from '../../features/basic-nodes';
import { BaseListPlugin } from '../../features/list';
import { BaseTablePlugin } from '../../features/table';
import { MarkdownPlugin } from '../../markdown';
import { createEditor as createProductEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const item = (text: string, extra: Record<string, unknown> = {}) => ({
  children: [{ text }],
  indent: 1,
  listId: 'l',
  listType: 'numbered',
  type: 'paragraph',
  ...extra,
});

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const createEditor = (
  value: Value,
  chatIndexes: number[],
  selection: TextSelection | null = null
) => {
  const editor = createProductEditor({
    plugins: [
      AuthoredPlugin,
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseBlockquotePlugin,
      BaseUnderlinePlugin,
      BaseListPlugin.configure({
        targetPlugins: [BaseParagraphPlugin, BaseHeadingPlugin],
      }),
      BaseTablePlugin,
      BaseAIPlugin,
      MarkdownPlugin.configure({
        initialState: { remarkPlugins: [remarkGfm] },
      }),
      AIChatPlugin,
    ],
    userId: 'alice',
    selection,
    initialValue: value,
  });

  editor.plugin(AIChatPlugin).store.set({
    mode: 'chat',
    chatSelection: selection,
    chatNodes: chatIndexes.map((index) => ({
      node: editor.read.children()[index],
      nodeKey: editor.key([index])!,
    })),
  });

  return editor;
};

const numbers = (editor: ReturnType<typeof createEditor>) =>
  editor.read
    .children()
    .map((node, index) =>
      node.listType === 'numbered'
        ? (editor.read.list.ordinal([index]) ?? null)
        : null
    );

describe('AIChatPlugin list output', () => {
  it('keeps decimal output separate from a Roman list', () => {
    const editor = createEditor(
      [
        item('I', { listStyle: 'upper-roman' }),
        item('II', { listStyle: 'upper-roman' }),
      ],
      [1]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. A\n2. B');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([1, 2, 1, 2]);
  });

  it('continues the list it inserts a numbered list below', () => {
    const editor = createEditor(
      [
        item('A'),
        item('B'),
        item('C'),
        { children: [{ text: 'Tail' }], type: 'paragraph' },
      ],
      [2]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. x\n2. y\n3. z');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([1, 2, 3, 4, 5, 6, null]);
  });

  it('keeps a replaced item in its list without the number its output wrote', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [1]);

    editor.plugin(AIChatPlugin).api.setPreview('2. B rewritten');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 3]);

    editor.update.nodes.remove({ at: [0] });

    expect(numbers(editor)).toEqual([1, 2]);
  });

  it('keeps the item after two replaced items counting on', () => {
    const editor = createEditor(
      [item('A'), item('B'), item('C'), item('D')],
      [1, 2]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. b\n2. c');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 3, 4]);
  });

  it('keeps the item after a replaced text selection counting on', () => {
    const editor = createEditor(
      [item('A'), item('B'), item('C'), item('D')],
      [1, 2],
      {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 1, path: [2, 0] },
        kind: 'text',
      }
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. b\n2. c');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 3, 4]);
  });

  it('keeps two lists of one response apart below a paragraph, with their starts', () => {
    const editor = createEditor([paragraph('Intro'), paragraph('Tail')], [0]);

    editor
      .plugin(AIChatPlugin)
      .api.setPreview('3. a\n4. b\n\nNote\n\n1. c\n2. d');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([null, 3, 4, null, 1, 2, null]);
  });

  it('joins the list after the replaced head of a list', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [0, 1]);

    editor.plugin(AIChatPlugin).api.setPreview('1. x\n2. y');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 3]);
  });

  it('keeps the start of a sublist in a response below a list', () => {
    const editor = createEditor([item('A'), item('B')], [1]);

    editor.plugin(AIChatPlugin).api.setPreview('1. x\n\n   3. sub');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([1, 2, 3, 3]);
  });

  it('joins the list items of a replaced text selection whose output ends in a table', () => {
    const editor = createEditor(
      [item('A'), item('B'), item('C'), item('D')],
      [1, 2],
      {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 1, path: [2, 0] },
        kind: 'text',
      }
    );

    editor
      .plugin(AIChatPlugin)
      .api.setPreview('1. x\n2. y\n\n| H |\n| --- |\n| v |');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 3, null, 4]);
  });

  it('keeps a replaced nested item at its depth', () => {
    const editor = createEditor(
      [
        item('A'),
        item('B', { indent: 2 }),
        item('C', { indent: 2 }),
        item('D'),
      ],
      [1]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. B rewritten');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(editor.read.children()[1]).toMatchObject({
      indent: 2,
      listId: 'l',
    });
  });

  it('keeps every item of a response over a nested item at its depth', () => {
    const editor = createEditor(
      [
        item('A'),
        item('B', { indent: 2 }),
        item('C', { indent: 2 }),
        item('D'),
      ],
      [1]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. x\n2. y');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 2, 2, 1,
    ]);
    expect(numbers(editor)).toEqual([1, 1, 2, 3, 2]);
  });

  it('keeps the nesting of a response below a nested item', () => {
    const editor = createEditor(
      [item('A'), item('B', { indent: 2 }), item('D')],
      [1]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. x\n   1. y');
    editor.plugin(AIChatPlugin).api.insertBelow({ format: 'all' });

    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 2, 3, 1,
    ]);
    expect(numbers(editor)).toEqual([1, 1, 2, 1, 2]);
  });

  it('keeps the start of a replaced list head', () => {
    const editor = createEditor(
      [item('A', { listStart: 5 }), item('B'), item('C')],
      [0]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. A rewritten');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([5, 6, 7]);
  });

  it('keeps a list below the paragraph a response lands after apart from it', () => {
    const editor = createEditor(
      [paragraph('Intro'), item('B', { listStart: 5 }), item('C')],
      [0]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. x');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([null, 1, 5, 6]);
  });

  it('keeps a later list of a response apart from the list it lands in', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [1]);

    editor
      .plugin(AIChatPlugin)
      .api.setPreview('1. x\n2. y\n\nNote\n\n7. z\n8. w');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([1, 2, 3, 4, null, 7, 8, 5]);
  });

  it('joins a long response that replaces a list head', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [0]);

    editor
      .plugin(AIChatPlugin)
      .api.setPreview(
        Array.from({ length: 65 }, (_, index) => `${index + 1}. x`).join('\n')
      );
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor).slice(-2)).toEqual([66, 67]);
  });

  it('keeps the list of the block a text rewrite starts in', () => {
    const defaultItem = (text: string) => {
      const { listId: _listId, ...rest } = item(text);

      return rest;
    };
    const editor = createEditor(
      [defaultItem('ABC'), paragraph('Note'), defaultItem('DEF')],
      [0],
      {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
        kind: 'text',
      }
    );
    const key = editor.key([0]);

    editor.plugin(AIChatPlugin).api.setPreview('1. X\n2. Y');
    editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'all' });

    expect(editor.key([0])).toBe(key);
    expect(numbers(editor)).toEqual([1, 2, null, 3]);
  });

  it('keeps a suggested rewrite of a nested item at its depth', () => {
    const editor = createEditor(
      [
        item('A'),
        item('B', { indent: 2 }),
        item('C', { indent: 2 }),
        item('D'),
      ],
      [1]
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ toolName: 'edit' });
    ai.api.setPreview('1. B rewritten');
    ai.api.accept();

    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 2, 1,
    ]);
  });

  it('keeps task output replacing a numbered item as tasks', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [1]);

    editor.plugin(AIChatPlugin).api.setPreview('- [ ] open\n- [x] done');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(editor.read.children().slice(1, 3)).toMatchObject([
      { checked: false, listType: 'task' },
      { checked: true, listType: 'task' },
    ]);
  });

  it('continues the list an accepted insert-mode response lands after', () => {
    const editor = createEditor(
      [item('A'), item('B'), { children: [{ text: '' }], type: 'paragraph' }],
      [],
      {
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
        kind: 'text',
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('1. c\n2. d');
    ai.api.accept();

    expect(numbers(editor)).toEqual([1, 2, 3, 4]);
  });

  it('rewrites the text of two items in place, keeping their list and latent start', () => {
    const editor = createEditor(
      [item('A'), item('B', { listStart: 5 })],
      [0, 1]
    );
    const keys = [editor.key([0]), editor.key([1])];
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ toolName: 'edit' });
    ai.api.setPreview('1. A2\n2. B2');
    ai.api.accept();

    expect(editor.read.children()).toEqual([
      item('A2'),
      item('B2', { listStart: 5 }),
    ]);
    expect([editor.key([0]), editor.key([1])]).toEqual(keys);
  });

  it('keeps a list it inserts below a numbered heading item apart from the heading list', () => {
    const heading = (text: string) => ({
      ...item(text, { listId: 'h' }),
      level: 1,
      type: 'heading',
    });
    const editor = createEditor([heading('H1'), heading('H2')], [0]);

    editor.plugin(AIChatPlugin).api.setPreview('1. a\n2. b');
    editor.plugin(AIChatPlugin).api.insertBelow();

    expect(numbers(editor)).toEqual([1, 1, 2, 2]);
  });

  it('drops the number a response wrote when it continues the list it lands below', () => {
    const editor = createEditor([item('A'), item('B')], [1]);

    editor.plugin(AIChatPlugin).api.setPreview('5. x');
    editor.plugin(AIChatPlugin).api.insertBelow();
    editor.update.nodes.remove({ at: [1] });
    editor.update.nodes.remove({ at: [0] });

    expect(numbers(editor)).toEqual([1]);
  });

  it('continues the outer list an accepted insert-mode response lands after a nested item', () => {
    const editor = createEditor(
      [item('A'), item('B', { indent: 2 }), paragraph('')],
      [],
      {
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
        kind: 'text',
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('1. c\n2. d');
    ai.api.accept();

    expect([
      editor.read.children().map((node) => node.indent),
      numbers(editor),
    ]).toEqual([
      [1, 2, 1, 1],
      [1, 1, 2, 3],
    ]);
  });

  it("gives a replaced head's start to the first list outside a table in the response", () => {
    const editor = createEditor([item('A', { listStart: 5 }), item('B')], [0]);

    editor
      .plugin(AIChatPlugin)
      .api.setPreview(
        '| H |\n| --- |\n| <ol start="7"><li>X</li></ol> |\n\n9. Y'
      );
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(
      [[0, 1, 0, 0], [1], [2]].map((path) => editor.read.list.ordinal(path))
    ).toEqual([7, 5, 6]);
  });

  it('keeps a preamble before a replacing list plain', () => {
    const editor = createEditor([item('A'), item('B'), item('C')], [1]);

    editor
      .plugin(AIChatPlugin)
      .api.setPreview("Here's the rewrite:\n\n1. Better B");
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, null, 2, 3]);
  });

  it("keeps an empty item's list and restart under an accepted insert-mode response", () => {
    const editor = createEditor(
      [item('A'), item('B'), item('', { listRestart: 1 }), item('D')],
      [],
      {
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
        kind: 'text',
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('1. c');
    ai.api.accept();

    expect([numbers(editor), editor.read.children()[2]]).toMatchObject([
      [1, 2, 1, 2],
      { listId: 'l', listRestart: 1 },
    ]);
  });

  it('keeps an insert-mode response on an empty line above a list apart from it', () => {
    const editor = createEditor(
      [paragraph(''), item('A', { listStart: 5 }), item('B')],
      [],
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('1. x');
    ai.api.accept();

    expect(numbers(editor)).toEqual([1, 5, 6]);
  });

  it('keeps a plain insert-mode response on an empty list item in its list', () => {
    const editor = createEditor([item('A'), item(''), item('C')], [], {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
      kind: 'text',
    });
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('Some sentence');
    ai.api.accept();

    expect(numbers(editor)).toEqual([1, 2, 3]);
  });

  it("keeps a replaced item's forced restart", () => {
    const editor = createEditor(
      [item('A'), item('B'), item('C', { listRestart: 1 }), item('D')],
      [2]
    );

    editor.plugin(AIChatPlugin).api.setPreview('1. c2');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect(numbers(editor)).toEqual([1, 2, 1, 2]);
  });

  it('keeps a nested item at its depth when a plain answer replaces it', () => {
    const editor = createEditor(
      [
        item('A'),
        item('Nested', { indent: 2 }),
        item('Other', { indent: 2 }),
        item('Tail'),
      ],
      [1]
    );

    editor.plugin(AIChatPlugin).api.setPreview('Plain rewritten');
    editor.plugin(AIChatPlugin).api.replaceSelection();

    expect([
      editor.read.children().map((node) => node.indent),
      numbers(editor),
    ]).toEqual([
      [1, 2, 2, 1],
      [1, 1, 2, 2],
    ]);
  });

  it('keeps a plain insert-mode response on an empty nested item at its depth', () => {
    const editor = createEditor(
      [item('A'), item('', { indent: 2 }), item('C', { indent: 2 })],
      [],
      {
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
        kind: 'text',
      }
    );
    const ai = editor.plugin(AIChatPlugin);

    ai.store.set({ chatSelection: null, mode: 'insert' });
    ai.api.setPreview('Some sentence');
    ai.api.accept();

    expect(editor.read.children().map((node) => node.indent)).toEqual([
      1, 2, 2,
    ]);
  });

  it('keeps a list that continues past a table when a cell answer rewrites its item', () => {
    const editor = createEditor(
      [
        item('Before', { listStart: 5 }),
        {
          children: [
            {
              children: [
                { children: [item('Cell')], type: 'tableCell' },
                { children: [paragraph('other')], type: 'tableCell' },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
        item('After'),
      ],
      []
    );
    const ai = editor.plugin(AIChatPlugin);

    editor.update.selection.setNodes([
      [1, 0, 0],
      [1, 0, 1],
    ]);
    ai.api.submit('rewrite', { toolName: 'edit' });
    ai.api.setTablePreview({ content: '6. Cell rewritten', ref: 'c1' });
    ai.api.accept();

    expect(
      [[0], [1, 0, 0, 0], [2]].map((path) => editor.read.list.ordinal(path))
    ).toEqual([5, 6, 7]);
  });

  describe('over selected text', () => {
    const textRange = (
      [anchorPath, anchorOffset]: [number[], number],
      [focusPath, focusOffset]: [number[], number]
    ): TextSelection => ({
      anchor: { offset: anchorOffset, path: anchorPath },
      focus: { offset: focusOffset, path: focusPath },
      kind: 'text',
    });
    const open = (value: Value, selection: TextSelection) => {
      const editor = createEditor(value, [], selection);
      const sendMessage = mock();

      editor.plugin(AIChatPlugin).store.set({
        chat: {
          clear: mock(),
          messages: [],
          regenerate: mock(async () => {}),
          sendMessage,
          status: 'ready' as const,
          stop: mock(),
        },
      });
      editor.plugin(AIChatPlugin).api.show();

      return { editor, sendMessage };
    };
    const RootHolderPlugin = definePlugin('aiTextRootHolder', {
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
    const headerRange = (
      [anchorPath, anchorOffset]: [number[], number],
      [focusPath, focusOffset]: [number[], number]
    ): TextSelection => ({
      anchor: { offset: anchorOffset, path: anchorPath, root: 'header' },
      focus: { offset: focusOffset, path: focusPath, root: 'header' },
      kind: 'text',
    });
    const rootEditor = (selection: TextSelection) =>
      createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseTablePlugin,
          BaseAIPlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
          AIChatPlugin,
          RootHolderPlugin,
        ],
        selection,
        initialValue: {
          children: [
            {
              childRoots: { body: 'header' },
              children: [{ text: '' }],
              type: 'aiTextRootHolder',
            },
          ],
          roots: { header: [paragraph('Alpha'), paragraph('Bravo')] },
        },
        userId: 'alice',
      });
    const captured = (editor: ReturnType<typeof createEditor>) => ({
      nodes: editor
        .plugin(AIChatPlugin)
        .store.get('chatNodes')
        .map(({ node }) => NodeApi.string(node)),
      selection: editor.plugin(AIChatPlugin).store.get('chatSelection'),
    });

    it("keeps both tasks of a task answer over all of an item's text", () => {
      const editor = createEditor(
        [item('A'), item('B')],
        [0],
        textRange([[0, 0], 0], [[0, 0], 1])
      );

      editor.plugin(AIChatPlugin).api.setPreview('- [ ] open\n- [x] done');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(
        editor.read
          .children()
          .slice(0, 2)
          .map((node) => node.checked)
      ).toEqual([false, true]);
    });

    it('keeps the start of a head whose whole text a table-first answer replaces', () => {
      const editor = createEditor(
        [item('A', { listStart: 5 }), item('B')],
        [0],
        textRange([[0, 0], 0], [[0, 0], 1])
      );

      editor
        .plugin(AIChatPlugin)
        .api.setPreview('| H |\n| --- |\n| v |\n\n1. x');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(numbers(editor)).toEqual([null, 5, 6]);
    });

    it('replaces a head and the next item under a table-first answer over part of them, keeping the start', () => {
      const { editor } = open(
        [item('Alpha', { listStart: 5 }), item('Bravo'), item('Charlie')],
        textRange([[0, 0], 0], [[1, 0], 2])
      );

      editor
        .plugin(AIChatPlugin)
        .api.setPreview('| H |\n| --- |\n| v |\n\n1. x');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(numbers(editor)).toEqual([null, 5, 6]);
    });

    it("rewrites only the head of a selection that ends at the next item's start", () => {
      const { editor } = open(
        [item('A', { listStart: 5 }), item('B')],
        textRange([[0, 0], 0], [[1, 0], 0])
      );

      editor
        .plugin(AIChatPlugin)
        .api.setPreview('| H |\n| --- |\n| v |\n\n1. x');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(numbers(editor)).toEqual([null, 5, 6]);
    });

    it("asks about only the item a selection from its middle to the next item's start covers", () => {
      const { editor, sendMessage } = open(
        [item('Alpha'), item('Bravo')],
        textRange([[0, 0], 2], [[1, 0], 0])
      );

      editor.plugin(AIChatPlugin).api.submit('rewrite');

      expect({
        ...captured(editor),
        request: sendMessage.mock.calls[0][1].body.ctx.selection,
      }).toMatchObject({
        nodes: ['Alpha'],
        request: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      });
    });

    it('asks about only the next item of a selection that starts at the end of an item', () => {
      const { editor } = open(
        [item('Alpha'), item('Bravo')],
        textRange([[0, 0], 5], [[1, 0], 2])
      );

      expect(captured(editor)).toMatchObject({
        nodes: ['Bravo'],
        selection: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      });
    });

    it('keeps the text around a suggestion over part of an item', () => {
      const editor = createEditor(
        [item('A'), item('prefix old suffix')],
        [1],
        textRange([[1, 0], 7], [[1, 0], 10])
      );
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ toolName: 'edit' });
      ai.api.setPreview('new');
      ai.api.accept();

      expect(NodeApi.string(editor.read.children()[1])).toBe(
        'prefix new suffix'
      );
    });

    it("keeps a blockquote whose only paragraph's text an answer replaces", () => {
      const editor = createEditor(
        [
          {
            children: [{ children: [{ text: 'Quote' }], type: 'paragraph' }],
            type: 'blockquote',
          },
        ],
        [0],
        textRange([[0, 0, 0], 0], [[0, 0, 0], 5])
      );

      editor.plugin(AIChatPlugin).api.setPreview('Better');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(editor.read.children()).toMatchObject([
        { children: [{ children: [{ text: 'Better' }] }], type: 'blockquote' },
      ]);
    });

    it('keeps the key and start of an item a list answer rewrites from its start', () => {
      const editor = createEditor(
        [item('Alpha', { listStart: 5 }), item('Bravo')],
        [0],
        textRange([[0, 0], 0], [[0, 0], 3])
      );
      const key = editor.key([0]);

      editor.plugin(AIChatPlugin).api.setPreview('1. x\n2. y');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect([editor.key([0]), editor.read.children()[0].listStart]).toEqual([
        key,
        5,
      ]);
    });

    it("asks about only the item a selection from its middle to the next item's start covers, with the menu closed", () => {
      const editor = createEditor(
        [item('Alpha'), item('Bravo')],
        [],
        textRange([[0, 0], 2], [[1, 0], 0])
      );
      const sendMessage = mock();

      editor.plugin(AIChatPlugin).store.set({
        chat: {
          clear: mock(),
          messages: [],
          regenerate: mock(async () => {}),
          sendMessage,
          status: 'ready' as const,
          stop: mock(),
        },
      });
      editor.plugin(AIChatPlugin).api.submit('rewrite');

      expect(sendMessage.mock.calls[0][1].body.ctx.selection).toMatchObject({
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      });
    });

    it("replaces a paragraph and a quote's paragraph a selection covers without leaving an empty quote", () => {
      const editor = createEditor(
        [
          paragraph('Alpha'),
          {
            children: [{ children: [{ text: 'Bravo' }], type: 'paragraph' }],
            type: 'blockquote',
          },
          paragraph('end'),
        ],
        [],
        textRange([[0, 0], 0], [[1, 0, 0], 5])
      );

      editor.plugin(AIChatPlugin).api.setPreview('Merged');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(editor.read.children()).toEqual([
        paragraph('Merged'),
        paragraph('end'),
      ]);
    });

    it('keeps only paragraphs in a box that holds paragraphs when a table answer replaces all of one', () => {
      const BoxPlugin = definePlugin('aiParagraphBox', {
        schema: {
          element: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
      });
      const selection = textRange([[0, 0, 0], 0], [[0, 0, 0], 5]);
      const editor = createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseTablePlugin,
          BaseAIPlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
          AIChatPlugin,
          BoxPlugin,
        ],
        selection,
        initialValue: [
          {
            children: [paragraph('Alpha'), paragraph('Bravo')],
            type: 'aiParagraphBox',
          },
          paragraph('end'),
        ],
        userId: 'alice',
      });
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('| H |\n| --- |\n| v |');
      ai.api.replaceSelection({ format: 'none' });

      expect(
        editor.read
          .children()
          .find((node) => node.type === 'aiParagraphBox')
          ?.children.every((node) => node.type === 'paragraph')
      ).toBe(true);
    });

    it('keeps the required heading of a box whose whole text an answer replaces', () => {
      const BoxPlugin = definePlugin('aiHeadingBox', {
        schema: {
          element: {
            content: schema.content.prefix(
              [{ element: 'heading', properties: { level: 1 } }],
              schema.content.group('block')
            ),
          },
        },
      });
      const selection = textRange([[0, 0, 0], 0], [[0, 0, 0], 5]);
      const editor = createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseHeadingPlugin,
          BaseAIPlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
          AIChatPlugin,
          BoxPlugin,
        ],
        selection,
        initialValue: [
          {
            children: [
              { children: [{ text: 'Title' }], level: 1, type: 'heading' },
              paragraph('Body'),
            ],
            type: 'aiHeadingBox',
          },
          paragraph('end'),
        ],
        userId: 'alice',
      });
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('New');
      ai.api.replaceSelection({ format: 'none' });

      expect(editor.read.children()[0]).toEqual({
        children: [
          { children: [{ text: 'New' }], level: 1, type: 'heading' },
          paragraph('Body'),
        ],
        type: 'aiHeadingBox',
      });
    });

    it('keeps the required heading of the main root when an answer replaces all of its text', () => {
      const selection = textRange([[0, 0], 0], [[0, 0], 5]);
      const editor = createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseHeadingPlugin,
          BaseAIPlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
          AIChatPlugin,
        ],
        schema: {
          root: schema.content.prefix(
            [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
            schema.content.group('block')
          ),
        },
        selection,
        initialValue: [
          { children: [{ text: 'Title' }], level: 1, type: 'heading' },
          paragraph('Body'),
        ],
        userId: 'alice',
      });
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('New');
      ai.api.replaceSelection({ format: 'none' });

      expect(editor.read.children()).toEqual([
        { children: [{ text: 'New' }], level: 1, type: 'heading' },
        paragraph('Body'),
      ]);
    });

    it('keeps the paragraph a box requires first when a heading answer replaces all of it', () => {
      const BoxPlugin = definePlugin('aiParagraphSlotBox', {
        schema: {
          element: {
            content: schema.content.prefix(
              [{ element: 'paragraph' }],
              schema.content.group('block')
            ),
          },
        },
      });
      const selection = textRange([[0, 0, 0], 0], [[0, 0, 0], 4]);
      const editor = createProductEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseHeadingPlugin,
          BaseAIPlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
          AIChatPlugin,
          BoxPlugin,
        ],
        selection,
        initialValue: [
          {
            children: [paragraph('Lead'), paragraph('Body')],
            type: 'aiParagraphSlotBox',
          },
          paragraph('end'),
        ],
        userId: 'alice',
      });
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('# New');
      ai.api.replaceSelection({ format: 'none' });

      expect(editor.read.children()[0]).toEqual({
        children: [paragraph('New'), paragraph('Body')],
        type: 'aiParagraphSlotBox',
      });
    });

    it('trims a hanging selection in a named root to the block it starts in', () => {
      const editor = rootEditor(headerRange([[0, 0], 2], [[1, 0], 0]));

      editor.plugin(AIChatPlugin).api.show();

      expect(captured(editor)).toMatchObject({
        nodes: ['Alpha'],
        selection: {
          anchor: { offset: 2, path: [0, 0], root: 'header' },
          focus: { offset: 5, path: [0, 0], root: 'header' },
        },
      });
    });

    it('keeps only paragraphs in a named root a table answer replaces all of one paragraph in', () => {
      const selection = headerRange([[0, 0], 0], [[0, 0], 5]);
      const editor = rootEditor(selection);
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('| H |\n| --- |\n| v |');
      ai.api.replaceSelection({ format: 'none' });

      expect(
        editor.read.root('header').every((node) => node.type === 'paragraph')
      ).toBe(true);
    });

    it('keeps the key and the text before a list answer that rewrites an item from its middle to its end', () => {
      const editor = createEditor(
        [item('Alpha', { listStart: 5 }), item('Bravo')],
        [0],
        textRange([[0, 0], 2], [[0, 0], 5])
      );
      const key = editor.key([0]);

      editor.plugin(AIChatPlugin).api.setPreview('1. x\n2. y');
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect([
        editor.key([0]),
        NodeApi.string(editor.read.children()[0]),
      ]).toEqual([key, 'Alx']);
    });

    it.each([
      ['table', '| H |\n| --- |\n| v |\n\n1. x'],
      ['quote', '> quote\n\n1. x'],
    ])(
      'leaves an item unchanged when a %s-first answer would replace part of its text',
      (_kind, answer) => {
        const editor = createEditor(
          [item('Alpha', { listStart: 5 }), item('Bravo')],
          [0],
          textRange([[0, 0], 1], [[0, 0], 3])
        );
        const before = editor.read.children();

        editor.plugin(AIChatPlugin).api.setPreview(answer);
        editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

        expect(editor.read.children()).toEqual(before);
      }
    );

    it("keeps a list answer to a suggestion inside an item in that item's list", () => {
      const editor = createEditor(
        [item('Alpha', { listStart: 5 }), item('Bravo')],
        [0],
        textRange([[0, 0], 1], [[0, 0], 3])
      );
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ toolName: 'edit' });
      ai.api.setPreview('1. x\n2. y');
      ai.api.accept();

      expect(numbers(editor)).toEqual([5, 6, 7]);
    });
  });

  describe('suggested', () => {
    const suggest = (value: Value, chatIndexes: number[], answer: string) => {
      const editor = createEditor(value, chatIndexes);
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ toolName: 'edit' });
      ai.api.setPreview(answer);
      ai.api.accept();

      return editor;
    };

    it('keeps two numbered lists of a suggestion apart', () => {
      const editor = suggest(
        [item('A', { listStart: 5 }), item('B'), item('C'), item('D')],
        [0, 1, 2],
        '1. a\n\n- note\n\n7. c'
      );

      expect(numbers(editor)).toEqual([5, null, 7, 6]);
    });

    it('keeps the depths of a nested item and a shallower one a suggestion rewrites', () => {
      const editor = suggest(
        [item('A'), item('B', { indent: 2 }), item('D'), item('E')],
        [1, 2],
        '1. B rewritten\n2. D rewritten'
      );

      expect([
        editor.read.children().map((node) => node.indent),
        numbers(editor),
      ]).toEqual([
        [1, 2, 1, 1],
        [1, 1, 2, 3],
      ]);
    });

    it('keeps the numbering of a list a paragraph splits through a rewrite of the same shape', () => {
      const editor = suggest(
        [item('A', { listStart: 5 }), paragraph('Note'), item('B'), item('D')],
        [0, 1, 2],
        '5. a\n\nNote rewritten\n\n6. b'
      );

      expect(numbers(editor)).toEqual([5, null, 6, 7]);
    });

    it('moves no depth or restart when a suggestion adds an item before the others', () => {
      const editor = suggest(
        [item('A'), item('B', { indent: 2 }), item('C', { listRestart: 1 })],
        [0, 1, 2],
        '1. New\n2. A\n   1. B\n3. C'
      );

      expect(
        editor.read.children().map((node) => [node.indent, node.listRestart])
      ).toEqual([
        [1, undefined],
        [1, undefined],
        [2, undefined],
        [1, undefined],
      ]);
    });

    it('keeps one list when a suggestion turns a paragraph into two items', () => {
      const editor = suggest(
        [paragraph('Intro'), paragraph('Tail')],
        [0],
        '1. X\n2. Y'
      );

      expect(numbers(editor)).toEqual([1, 2, null]);
    });

    it('keeps an item in its list when a suggestion drops its marker', () => {
      const editor = createEditor([item('A'), item('B'), item('C')], [1]);
      const key = editor.key([1]);
      const ai = editor.plugin(AIChatPlugin);

      ai.store.set({ toolName: 'edit' });
      ai.api.setPreview('B rewritten');
      ai.api.accept();

      expect([editor.key([1]), numbers(editor)]).toEqual([key, [1, 2, 3]]);
    });

    it('drops the list of items a suggestion writes without their markers', () => {
      const editor = suggest(
        [item('A'), item('B'), item('C')],
        [0, 1, 2],
        'A\n\nB\n\nC'
      );

      expect(numbers(editor)).toEqual([null, null, null]);
    });

    it('keeps the level a suggestion gives a heading', () => {
      const editor = suggest(
        [{ children: [{ text: 'Old' }], level: 1, type: 'heading' }],
        [0],
        '## New'
      );

      expect(editor.read.children()[0].level).toBe(2);
    });

    it('keeps an item with an underlined word in its list through a rewrite', () => {
      const editor = suggest(
        [
          item('X'),
          {
            ...item(''),
            children: [
              { text: 'A ' },
              { text: 'u', underline: true },
              { text: ' end' },
            ],
          },
          item('Y'),
        ],
        [1],
        '1. A u end better'
      );

      expect(numbers(editor)).toEqual([1, 2, 3]);
    });
  });
});
