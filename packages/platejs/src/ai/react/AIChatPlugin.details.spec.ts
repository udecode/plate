import remarkGfm from 'remark-gfm';

import { AuthoredPlugin } from '../../authored';
import {
  BaseParagraphPlugin,
  createEditorView,
  definePlugin,
  type Editor,
  NodeApi,
  schema,
} from '../../core';
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
    const root = view.read.view.root();

    editor.plugin(AIChatPlugin).store.set({
      chatNodes: paths.map((path) => ({
        node: view.read.nodes.get(path)![0],
        nodeKey: view.key(path)!,
        ...(root ? { root } : {}),
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
