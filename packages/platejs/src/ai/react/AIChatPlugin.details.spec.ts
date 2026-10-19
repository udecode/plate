import remarkGfm from 'remark-gfm';

import { AuthoredPlugin } from '../../authored';
import {
  BaseParagraphPlugin,
  createEditorView,
  definePlugin,
  ElementApi,
  type Editor,
  NodeApi,
  schema,
  SelectionApi,
} from '../../core';
import { setEditorReadOnly } from '../../facade';
import { BaseBlockquotePlugin } from '../../features/basic-nodes';
import { BaseDetailsPlugin } from '../../features/details';
import { BaseTablePlugin } from '../../features/table/lib/BaseTablePlugin';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

// A closed Details whose title holds the caret, followed by one paragraph.
const titled = (title: string) => {
  const selection = {
    anchor: { offset: title.length, path: [0, 0, 0] },
    focus: { offset: title.length, path: [0, 0, 0] },
    kind: 'text' as const,
  };
  const editor = createEditor({
    plugins: [
      AuthoredPlugin,
      BaseParagraphPlugin,
      BaseDetailsPlugin,
      BaseAIPlugin,
      MarkdownPlugin.configure({
        initialState: { remarkPlugins: [remarkGfm] },
      }),
      AIChatPlugin,
    ],
    userId: 'alice',
    selection,
    initialValue: [
      {
        children: [
          { children: [{ text: title }], type: 'summary' },
          paragraph('Body'),
        ],
        type: 'details',
      },
      paragraph('After'),
    ],
  });
  const ai = editor.plugin(AIChatPlugin);
  const run = (action: 'accept' | 'Insert below') => {
    if (action === 'accept') {
      ai.store.set({ chatSelection: null, mode: 'insert' });
      ai.api.setPreview('Answer');
      ai.api.accept();
    } else {
      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('Answer');
      ai.api.insertBelow();
    }
  };

  return { editor, run };
};

describe('AIChatPlugin from a closed Details title', () => {
  it.each([
    ['accept', 'Title'],
    ['accept', ''],
    ['Insert below', 'Title'],
    ['Insert below', ''],
  ] as const)(
    'lands %s output after the Details from the title %j',
    (action, title) => {
      const { editor, run } = titled(title);
      const summary = editor.key([0, 0]);

      run(action);

      expect({
        caret: editor.read.selection()?.focus.path,
        children: editor.read.children(),
        title: summary && editor.read.nodes.get(summary)?.[1],
      }).toEqual({
        caret: [1, 0],
        children: [
          {
            children: [
              { children: [{ text: title }], type: 'summary' },
              paragraph('Body'),
            ],
            type: 'details',
          },
          paragraph('Answer'),
          paragraph('After'),
        ],
        title: [0, 0],
      });
    }
  );
});

describe('AIChatPlugin over a Details title', () => {
  const summary = (text: string) => ({ children: [{ text }], type: 'summary' });
  const details = (...children: unknown[]) => ({ children, type: 'details' });
  const TestObject = definePlugin('testObject', {
    schema: { element: schema.element.textBlock({ object: true }) },
  });
  const HeaderHolder = definePlugin('testHeaderHolder', {
    schema: {
      element: {
        blockContent: true,
        contentRoots: {
          body: {
            content: schema.content.any(
              [
                schema.content.type('blockquote').allowed,
                schema.content.type('details').allowed,
                schema.content.type('paragraph').allowed,
                schema.content.type('testObject').allowed,
              ],
              { default: { type: 'paragraph' }, min: 1 }
            ),
            ownership: 'exclusive',
          },
        },
        void: 'block',
      },
    },
  });
  const create = (
    header?: unknown[],
    main: unknown[] = [details(summary('Title'), paragraph('Body'))]
  ) =>
    createEditor({
      plugins: [
        AuthoredPlugin,
        BaseParagraphPlugin,
        BaseBlockquotePlugin,
        BaseTablePlugin,
        BaseDetailsPlugin,
        BaseAIPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkGfm] },
        }),
        AIChatPlugin,
        HeaderHolder,
        TestObject,
      ],
      userId: 'alice',
      initialValue: header
        ? ({
            children: [
              ...main,
              {
                childRoots: { body: 'header' },
                children: [{ text: '' }],
                type: 'testHeaderHolder',
              },
            ],
            roots: { header },
          } as never)
        : (main as never),
    });
  const pick = (
    editor: ReturnType<typeof create>,
    paths: number[][],
    view: Editor = editor
  ) => {
    editor.plugin(AIChatPlugin).store.set({
      chatNodes: paths.map((path) => ({
        node: view.read.nodes.get(path, { match: ElementApi.isElement })![0],
        nodeKey: view.key(path)!,
      })),
      chatSelection: null,
      mode: 'chat',
    });
  };
  const caret = (from: number, to = from) => ({
    anchor: { offset: from, path: [0, 0, 0] },
    focus: { offset: to, path: [0, 0, 0] },
    kind: 'text' as const,
  });

  it('makes the first answer block the title of a picked title, alone or with its body', () => {
    for (const [paths, answer, expected] of [
      [[[0, 0]], 'X', [summary('X'), paragraph('Body')]],
      [
        [
          [0, 0],
          [0, 1],
        ],
        'X\n\nY',
        [summary('X'), paragraph('Y')],
      ],
    ] as const) {
      const editor = create();

      pick(editor, paths as unknown as number[][]);
      editor.plugin(AIChatPlugin).api.setPreview(answer);
      editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect(editor.read.children()).toEqual([details(...expected)]);
    }
  });

  it('types the answer for the root the picked title lives in', () => {
    const named = create(
      [details(summary('Title'), paragraph('Body'))],
      [paragraph('Main')]
    );
    const header = createEditorView(named, { root: 'header' });

    pick(named, [[0, 0]], header);
    named.plugin(AIChatPlugin).api.setPreview('X');
    named.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    const main = create([{ children: [paragraph('Q')], type: 'blockquote' }]);
    const quoteView = createEditorView(main, { root: 'header' });

    pick(main, [[0, 0]]);
    quoteView.plugin(AIChatPlugin).api.setPreview('X');
    quoteView.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    expect([header.read.children(), main.read.children()[0]]).toEqual([
      [details(summary('X'), paragraph('Body'))],
      details(summary('X'), paragraph('Body')),
    ]);
  });

  it.each([
    [
      'block',
      (editor: Editor) =>
        editor.update.selection.setNodes([editor.read.children()[0]]),
    ],
    [
      'text',
      (editor: Editor) =>
        editor.update.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        }),
    ],
  ] as const)(
    'keeps a main %s selection captured through a named view in main',
    (_, select) => {
      const editor = create([paragraph('Note')], [paragraph('Main')]);
      select(editor);
      const view = createEditorView(editor, { root: 'header' });

      view.plugin(AIChatPlugin).api.show();
      view.plugin(AIChatPlugin).api.setPreview('Answer');
      view.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

      expect({
        main: NodeApi.string(editor.read.children()[0]),
        note: editor.read.root('header'),
        root: SelectionApi.root(editor.read.selection()),
      }).toEqual({
        main: 'Answer',
        note: [paragraph('Note')],
        root: undefined,
      });
    }
  );

  it('stops later chunks after an edit moves the picked block in its named root', () => {
    const editor = create(
      [paragraph('old'), paragraph('tail')],
      [paragraph('Main')]
    );
    const header = createEditorView(editor, { root: 'header' });
    pick(editor, [[0]], header);
    const ai = editor.plugin(AIChatPlugin);
    ai.store.set({ toolName: 'edit' });

    ai.api.setPreview('new');
    createEditorView(editor, {
      authored: { intent: 'edit' },
      root: 'header',
    }).update((tx) => {
      tx.nodes.insert(paragraph('independent'), { at: [0] });
    });
    const before = editor.read.value();

    ai.api.setPreview('next');

    expect(editor.read.value()).toEqual(before);
  });

  it('selects the rewritten named title after a main-editor answer', () => {
    const editor = create(
      [details(summary('Title'), paragraph('Body'))],
      [paragraph('Main')]
    );
    const view = createEditorView(editor, { root: 'header' });
    pick(editor, [[0, 0]], view);
    const ai = editor.plugin(AIChatPlugin);

    ai.api.setPreview('Answer');
    ai.api.replaceSelection({ format: 'none' });

    expect({
      root: SelectionApi.root(editor.read.selection()),
      selected: editor.read.selection
        .nodes()
        .map(([node]) => NodeApi.string(node)),
    }).toEqual({ root: 'header', selected: ['Answer'] });
  });

  it.each([
    ['main', 'block'],
    ['main', 'object'],
    ['header', 'block'],
    ['header', 'object'],
  ] as const)(
    'builds the request from a node selection in %s in %s mode',
    (root, mode) => {
      const block = (text: string) =>
        mode === 'object'
          ? { ...paragraph(text), type: 'testObject' }
          : paragraph(text);
      const editor = create([block('Note')], [block('Main')]);
      const view = createEditorView(editor, { root: 'header' });
      const source = root === 'main' ? editor : view;
      const command = root === 'main' ? view : editor;
      source.update.selection.setNodes([source.read.children()[0]], { mode });
      const ai = editor.plugin(AIChatPlugin);
      let request: unknown;
      ai.store.set({
        chat: {
          clear: () => {},
          messages: [],
          regenerate: async () => {},
          sendMessage: async (_text, options) => {
            request = options?.body;
          },
          status: 'ready',
          stop: () => {},
        },
      });

      command.plugin(AIChatPlugin).api.submit('Rewrite');

      expect(request).toMatchObject({
        ctx: {
          children: root === 'main' ? editor.read.children() : [block('Note')],
          nodeSelection: {
            paths: [[0]],
            anchorPath: [0],
            focusPath: [0],
            mode,
          },
          refs: { blocks: [{ path: [0], ref: 'b1' }] },
        },
      });
    }
  );

  it.each(['', 'Note'])(
    'accepts insert output in the captured named block %j',
    (text) => {
      const editor = create([paragraph(text)], [paragraph('Main')]);
      const main = editor.read.children();
      editor.update.selection.set({
        path: [0, 0],
        offset: text.length,
        root: 'header',
      });
      const ai = editor.plugin(AIChatPlugin);
      ai.api.show();

      ai.api.setPreview('Answer');
      ai.api.accept();

      expect({
        main: editor.read.children(),
        note: editor.read.root('header'),
        root: SelectionApi.root(editor.read.selection()),
      }).toEqual({
        main,
        note: text
          ? [paragraph(text), paragraph('Answer')]
          : [paragraph('Answer')],
        root: 'header',
      });
    }
  );

  it('keeps a main capture read-only when accepted from a named view', () => {
    const editor = create([paragraph('Note')], [paragraph('Main')]);
    const view = createEditorView(editor, { root: 'header', readOnly: true });
    const before = editor.read.value();
    pick(editor, [[0]]);

    view.plugin(AIChatPlugin).api.setPreview('Answer');
    expect(() =>
      view.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' })
    ).toThrow('read-only');

    expect(editor.read.value()).toEqual(before);
  });

  it('keeps proposing intent when a named view accepts a main capture', () => {
    const editor = create([paragraph('Note')], [paragraph('Main')]);
    const view = createEditorView(editor, {
      root: 'header',
      authored: { intent: 'propose' },
    });
    pick(editor, [[0]]);

    view.plugin(AIChatPlugin).api.setPreview('Answer');
    view.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    expect({
      changes: editor.plugin(AuthoredPlugin).read.changes().items.length,
      note: editor.read.root('header'),
    }).toEqual({ changes: 1, note: [paragraph('Note')] });
  });

  it('skips restoring selection when the base command editor is read-only', () => {
    const editor = create();
    editor.update.selection.set({ path: [0, 0, 0], offset: 2 });
    const ai = editor.plugin(AIChatPlugin);
    ai.api.show();
    editor.update.selection.set({ path: [0, 1, 0], offset: 1 });
    const selection = editor.read.selection();
    setEditorReadOnly(editor, true);

    ai.api.reset();

    expect(editor.read.selection()).toEqual(selection);
  });

  it('keeps a picked title when the answer starts with a table', () => {
    const editor = create();

    pick(editor, [[0, 0]]);
    editor.plugin(AIChatPlugin).api.setPreview('| a |\n| - |\n| 1 |');
    editor.plugin(AIChatPlugin).api.replaceSelection({ format: 'none' });

    expect(editor.read.children()[0].children.map((node) => node.type)).toEqual(
      ['summary', 'table', 'paragraph']
    );
    expect(NodeApi.string(editor.read.children()[0].children[0])).toBe('Title');
  });

  it('lands answers after an open title as body paragraphs', () => {
    const below = create();
    const rewritten = create();

    for (const editor of [below, rewritten]) {
      editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, true);
    }
    below.plugin(AIChatPlugin).store.set({
      chatNodes: [],
      chatSelection: caret(5),
      mode: 'chat',
    });
    below.plugin(AIChatPlugin).api.setPreview('X');
    below.plugin(AIChatPlugin).api.insertBelow();
    rewritten.plugin(AIChatPlugin).store.set({
      chatNodes: [],
      chatSelection: caret(0, 5),
      mode: 'chat',
    });
    rewritten.plugin(AIChatPlugin).api.setPreview('X\n\nY');
    rewritten.plugin(AIChatPlugin).api.replaceSelection({ format: 'all' });

    expect([below.read.children(), rewritten.read.children()]).toEqual([
      [details(summary('Title'), paragraph('X'), paragraph('Body'))],
      [details(summary('X'), paragraph('Y'), paragraph('Body'))],
    ]);
  });
});
