import { expect, it } from 'bun:test';

import {
  createEditor,
  createEditorView,
  definePlugin,
  type Editor,
  type Location,
  property,
  schema,
  type Value,
} from '../../core';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '../../features/basic-nodes';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../../features/basic-styles';
import { BaseCalloutPlugin } from '../../features/callout';
import { BaseCodeBlockPlugin } from '../../features/code-block';
import { BaseDetailsPlugin } from '../../features/details';
import { BaseColumnGroupPlugin } from '../../features/layout';
import { BaseListPlugin } from '../../features/list';
import { BaseImagePlugin } from '../../features/media';
import { BaseTablePlugin } from '../../features/table';
import { BaseTocPlugin } from '../../features/toc';
import { BaseUploadPlugin } from '../../features/upload';
import { BaseEquationPlugin } from '../../math';
import { BaseParagraphPlugin } from '../plugins/paragraph';

const plugins = [
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseCalloutPlugin,
  BaseDetailsPlugin,
  BaseColumnGroupPlugin,
  BaseImagePlugin,
  BaseUploadPlugin,
  BaseTablePlugin,
  BaseTocPlugin,
  BaseEquationPlugin,
];
const cases: Array<{ type: string; insert: (editor: Editor) => void }> = [
  {
    type: 'heading',
    insert: (editor) =>
      editor
        .plugin(BaseHeadingPlugin)
        .update.insert({ level: 2 }, { select: true }),
  },
  {
    type: 'blockquote',
    insert: (editor) =>
      editor.plugin(BaseBlockquotePlugin).update.insert({}, { select: true }),
  },
  {
    type: 'horizontalRule',
    insert: (editor) =>
      editor
        .plugin(BaseHorizontalRulePlugin)
        .update.insert({}, { select: true }),
  },
  {
    type: 'callout',
    insert: (editor) =>
      editor.plugin(BaseCalloutPlugin).update.insert({}, { select: true }),
  },
  {
    type: 'details',
    insert: (editor) =>
      editor.plugin(BaseDetailsPlugin).update.insert({}, { select: true }),
  },
  {
    type: 'columnGroup',
    insert: (editor) =>
      editor
        .plugin(BaseColumnGroupPlugin)
        .update.insert({ columns: 3 }, { select: true }),
  },
  {
    type: 'image',
    insert: (editor) =>
      editor
        .plugin(BaseImagePlugin)
        .update.insert(
          { url: 'https://example.com/image.png' },
          { select: true }
        ),
  },
  {
    type: 'upload',
    insert: (editor) =>
      editor
        .plugin(BaseUploadPlugin)
        .update.insert({ kind: 'video' }, { select: true }),
  },
  {
    type: 'table',
    insert: (editor) =>
      editor.plugin(BaseTablePlugin).update.insert({}, { select: true }),
  },
  {
    type: 'toc',
    insert: (editor) =>
      editor.plugin(BaseTocPlugin).update.insert({}, { select: true }),
  },
  {
    type: 'equation',
    insert: (editor) =>
      editor.plugin(BaseEquationPlugin).update.insert({}, { select: true }),
  },
];

it.each(cases)(
  'inserts $type through its owner with one commit and an owned destination',
  ({ type, insert }) => {
    for (const text of ['', 'Existing content']) {
      const initialValue = [{ type: 'paragraph', children: [{ text }] }];
      const editor = createEditor({
        plugins,
        initialValue,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      });
      const version = editor.read.lastCommit()?.version ?? 0;
      insert(editor);
      expect(editor.read.children()).toHaveLength(text ? 2 : 1);
      expect(editor.read.children().at(-1)?.type).toBe(type);
      expect(editor.read.lastCommit()?.version).toBe(version + 1);
      expect(editor.read.selection()?.anchor.path[0]).toBe(text ? 1 : 0);
      if (type === 'details') {
        expect(editor.read.selection()?.anchor.path.slice(1)).toEqual([0, 0]);
        expect(
          editor
            .plugin(BaseDetailsPlugin)
            .api.isOpen(editor.key([text ? 1 : 0])!)
        ).toBe(true);
      }
      if (type === 'columnGroup') {
        expect(editor.read.selection()?.anchor.path.slice(1)).toEqual([
          0, 0, 0,
        ]);
      }
      if (type === 'table') {
        expect(editor.read.selection()?.anchor.path.slice(1)).toEqual([
          0, 0, 0, 0,
        ]);
      }
      editor.api.history.undo();
      expect(editor.read.children()).toEqual(initialValue);
    }
  }
);

it('inserts after an explicit stable block without changing an unrelated selection', () => {
  const editor = createEditor({
    plugins,
    initialValue: [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'keep' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
  });
  const after = editor.key([0])!;
  editor
    .plugin(BaseCalloutPlugin)
    .update.insert({}, { after, replaceEmpty: true });
  expect(editor.read.children().map((n) => n.type)).toEqual([
    'callout',
    'paragraph',
  ]);
  expect(editor.read.selection()?.anchor).toEqual({ path: [1, 0], offset: 2 });
});

it('inserts before an explicit stable block key', () => {
  const editor = createEditor({
    plugins,
    initialValue: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
  });
  const before = editor.key([1])!;

  editor.plugin(BaseCalloutPlugin).update.insert({}, { before });

  expect(editor.read.children().map((node) => node.type)).toEqual([
    'paragraph',
    'callout',
    'paragraph',
  ]);
});

it('throws for replaceEmpty beside before instead of dropping it', () => {
  const editor = createEditor({
    plugins,
    initialValue: [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
  });
  const value = editor.read.value();
  const before = editor.key([1])!;

  expect(() =>
    editor
      .plugin(BaseCalloutPlugin)
      .update.insert({}, { before, replaceEmpty: true } as never)
  ).toThrow('replaceEmpty applies only to an after landing');
  expect(editor.read.value()).toEqual(value);
});

it('keeps explicit at as insertion before that path', () => {
  const editor = createEditor({
    plugins,
    initialValue: [{ type: 'paragraph', children: [{ text: 'keep' }] }],
  });
  editor.plugin(BaseDetailsPlugin).update.insert({}, { at: [0], select: true });
  expect(editor.read.children().map((n) => n.type)).toEqual([
    'details',
    'paragraph',
  ]);
  expect(editor.read.selection()?.anchor.path).toEqual([0, 0, 0]);
});

it('inserts a table beside the current table, with its first cell selected', () => {
  const editor = createEditor({
    plugins,
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  editor.plugin(BaseTablePlugin).update.insert({}, { select: true });
  editor.plugin(BaseTablePlugin).update.insert({}, { select: true });
  expect(editor.read.children().map((n) => n.type)).toEqual(['table', 'table']);
  expect(editor.read.selection()?.anchor.path).toEqual([1, 0, 0, 0, 0]);
});

const FullParentPlugin = definePlugin('fullParent', {
  schema: {
    element: {
      blockContent: true,
      content: schema.content.types(
        [
          'callout',
          'codeBlock',
          'columnGroup',
          'details',
          'image',
          'paragraph',
          'table',
        ],
        { max: 1 }
      ),
    },
  },
});
const inFullParent = (text: string) =>
  createEditor({
    plugins: [
      ...plugins,
      BaseCodeBlockPlugin,
      BaseListPlugin,
      FullParentPlugin,
    ],
    initialValue: [
      {
        type: 'fullParent',
        children: [{ type: 'paragraph', children: [{ text }] }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0, 0], offset: text.length },
      focus: { path: [0, 0, 0], offset: text.length },
    },
  });

it.each<[string, (editor: Editor) => boolean]>([
  [
    'callout from the caret',
    (editor) => editor.plugin(BaseCalloutPlugin).update.insert(),
  ],
  [
    'callout after a block',
    (editor) =>
      editor
        .plugin(BaseCalloutPlugin)
        .update.insert({}, { after: editor.key([0, 0])! }),
  ],
  [
    'callout before a block',
    (editor) =>
      editor
        .plugin(BaseCalloutPlugin)
        .update.insert({}, { before: editor.key([0, 0])! }),
  ],
  [
    'callout at a path',
    (editor) =>
      editor.plugin(BaseCalloutPlugin).update.insert({}, { at: [0, 1] }),
  ],
  [
    'code block',
    (editor) => editor.plugin(BaseCodeBlockPlugin).update.insert(),
  ],
  [
    'column group',
    (editor) =>
      editor.plugin(BaseColumnGroupPlugin).update.insert({ columns: 2 }),
  ],
  ['details', (editor) => editor.plugin(BaseDetailsPlugin).update.insert()],
  [
    'image',
    (editor) =>
      editor
        .plugin(BaseImagePlugin)
        .update.insert({ url: 'https://example.com/image.png' }),
  ],
  [
    'list',
    (editor) =>
      editor.plugin(BaseListPlugin).update.insert({ type: 'bulleted' }),
  ],
  ['table', (editor) => editor.plugin(BaseTablePlugin).update.insert()],
])(
  'refuses a %s insert into a full parent and changes nothing',
  (_, insert) => {
    const editor = inFullParent('Only');
    const children = editor.read.children();
    const inserted = insert(editor);

    expect({ children: editor.read.children(), inserted }).toEqual({
      children,
      inserted: false,
    });
  }
);

it('replaces the empty block of a full parent through upsert', () => {
  const editor = inFullParent('');
  const upserted = editor.plugin(BaseCalloutPlugin).update.upsert();

  expect({
    types: editor.read.children()[0].children.map((node) => node.type),
    upserted,
  }).toEqual({ types: ['callout'], upserted: true });
});

it('lands a table placed after a cell block in that cell', () => {
  const editor = createEditor({
    plugins,
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  const table = editor.plugin(BaseTablePlugin);

  table.update.insert();
  const inserted = table.update.insert(
    {},
    { after: editor.key([0, 0, 0, 0])! }
  );

  expect({
    cell: editor.read.nodes.get([0, 0, 0])?.[0],
    inserted,
    types: editor.read.children().map((node) => node.type),
  }).toMatchObject({
    cell: { children: [{ type: 'table' }], type: 'tableCell' },
    inserted: true,
    types: ['table'],
  });
});

it('inserts a table from a closed Details title in a cell after that table', () => {
  const editor = createEditor({
    plugins,
    initialValue: [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [
                  {
                    type: 'details',
                    children: [
                      { type: 'summary', children: [{ text: 'Title' }] },
                      { type: 'paragraph', children: [{ text: 'Body' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0, 0, 0, 0, 0], offset: 5 },
      focus: { path: [0, 0, 0, 0, 0, 0], offset: 5 },
    },
  });

  editor.plugin(BaseTablePlugin).update.insert();

  expect({
    cell: editor.read.nodes
      .get([0, 0, 0])?.[0]
      .children.map((node: { type?: string }) => node.type),
    types: editor.read.children().map((node) => node.type),
  }).toEqual({ cell: ['details'], types: ['table', 'table'] });
});

it('creates a sibling for insert and reuses a matching empty block for upsert', () => {
  const createHeadingEditor = () =>
    createEditor({
      plugins,
      initialValue: [{ type: 'heading', level: 2, children: [{ text: '' }] }],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
  const insertEditor = createHeadingEditor();

  insertEditor
    .plugin(BaseHeadingPlugin)
    .update.insert({ level: 2 }, { select: true });
  expect(insertEditor.read.children()).toHaveLength(2);

  const upsertEditor = createHeadingEditor();
  const block = upsertEditor.read.children()[0];
  const key = upsertEditor.key(block);

  expect(
    upsertEditor
      .plugin(BaseHeadingPlugin)
      .update.upsert({ level: 2 }, { select: true })
  ).toBe(true);
  expect(upsertEditor.read.children()).toHaveLength(1);
  expect(upsertEditor.key(upsertEditor.read.children()[0])).toBe(key);
});

it('uses list identity for authored insert and upsert', () => {
  const createListEditor = () =>
    createEditor({
      plugins: [BaseParagraphPlugin, BaseListPlugin],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
          indent: 1,
          listType: 'bulleted',
        },
      ],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });
  const insertEditor = createListEditor();

  insertEditor
    .plugin(BaseListPlugin)
    .update.insert({ type: 'bulleted' }, { select: true });
  expect(insertEditor.read.children()).toHaveLength(2);

  const upsertEditor = createListEditor();
  const key = upsertEditor.key(upsertEditor.read.children()[0]);

  expect(
    upsertEditor
      .plugin(BaseListPlugin)
      .update.upsert({ type: 'bulleted' }, { select: true })
  ).toBe(true);
  expect(upsertEditor.read.children()).toHaveLength(1);
  expect(upsertEditor.key(upsertEditor.read.children()[0])).toBe(key);
});

const RootHolderPlugin = definePlugin('insertRootHolder', {
  schema: {
    element: {
      blockContent: true,
      contentRoots: {
        body: {
          content: schema.content.types([
            'codeBlock',
            'columnGroup',
            'paragraph',
            'table',
          ]),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  },
});

const inHeaderRoot = (
  header: Value,
  focus: { offset: number; path: number[]; root?: 'header' } = {
    offset: 0,
    path: [0, 0],
  }
) =>
  createEditor({
    plugins: [...plugins, BaseCodeBlockPlugin, RootHolderPlugin],
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'main' }] },
        {
          childRoots: { body: 'header' },
          children: [{ text: '' }],
          type: 'insertRootHolder',
        },
      ],
      roots: { header },
    },
    selection: { kind: 'text', anchor: focus, focus },
  });

const emptyCodeBlock = { type: 'codeBlock', children: [{ text: '' }] };
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

it.each<[string, Location]>([
  ['path', [0, 9]],
  [
    'range',
    { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 9], offset: 0 } },
  ],
])(
  'refuses an upsert after a missing nested %s without reusing its ancestor',
  (_, after) => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      initialValue: [emptyCodeBlock],
    });
    const upserted = editor
      .plugin(BaseCodeBlockPlugin)
      .update.upsert({ language: 'ts' }, { after });

    expect({ children: editor.read.children(), upserted }).toEqual({
      children: [emptyCodeBlock],
      upserted: false,
    });
  }
);

it.each<[string, Value, number[], boolean, Value]>([
  [
    'reuses the empty code block a point in another root names',
    [paragraph('one'), paragraph('two'), emptyCodeBlock],
    [2, 0],
    true,
    [paragraph('one'), paragraph('two'), { ...emptyCodeBlock, language: 'ts' }],
  ],
  [
    'refuses an upsert after a point missing from its own root',
    [emptyCodeBlock],
    [1, 0],
    false,
    [emptyCodeBlock],
  ],
])('%s', (_, header, path, upserted, expected) => {
  const editor = inHeaderRoot(header);
  const result = editor
    .plugin(BaseCodeBlockPlugin)
    .update.upsert(
      { language: 'ts' },
      { after: { offset: 0, path, root: 'header' } }
    );

  expect({
    header: createEditorView(editor, { root: 'header' }).read.children(),
    result,
  }).toEqual({ header: expected, result: upserted });
});

it('inserts a table beside a table the caret is in in another root', () => {
  const editor = inHeaderRoot([paragraph('head')]);
  const header = createEditorView(editor, { root: 'header' });

  header.plugin(BaseTablePlugin).update.insert({}, { at: [0] });
  editor.update((tx) => tx.selection.set(header.read.points.start([0])!));
  const inserted = editor.plugin(BaseTablePlugin).update.insert();

  expect({
    inserted,
    types: header.read.children().map((node) => node.type),
  }).toEqual({ inserted: true, types: ['table', 'table', 'paragraph'] });
});

it.each<
  [
    string,
    (editor: Editor, before: NonNullable<ReturnType<Editor['key']>>) => boolean,
  ]
>([
  [
    'column group',
    (editor, before) =>
      editor
        .plugin(BaseColumnGroupPlugin)
        .update.insert({ columns: 2 }, { before, select: true }),
  ],
  [
    'table',
    (editor, before) =>
      editor
        .plugin(BaseTablePlugin)
        .update.insert({}, { before, select: true }),
  ],
])('selects the start of a %s inserted into another root', (_, insert) => {
  const editor = inHeaderRoot([
    paragraph('one'),
    paragraph('two'),
    paragraph('three'),
  ]);
  const header = createEditorView(editor, { root: 'header' });

  insert(editor, header.key([2])!);

  expect(editor.read.selection()?.focus).toEqual({
    offset: 0,
    path: header.read.points.start([2])!.path,
    root: 'header',
  });
});

it('reuses a matching empty code block for upsert', () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
    initialValue: [{ type: 'codeBlock', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  const key = editor.key([0]);
  const upserted = editor
    .plugin(BaseCodeBlockPlugin)
    .update.upsert({ language: 'ts' }, { select: true });

  expect({
    children: editor.read.children(),
    key: editor.key([0]),
    upserted,
  }).toEqual({
    children: [{ type: 'codeBlock', language: 'ts', children: [{ text: '' }] }],
    key,
    upserted: true,
  });
});

it('preserves presentation properties when upserting a matching paragraph', () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, BaseTextAlignPlugin, BaseLineHeightPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
        lineHeight: 2,
        textAlign: 'center',
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  const key = editor.key(editor.read.children()[0]);

  editor.plugin(BaseParagraphPlugin).update.upsert({}, { select: true });

  expect(editor.read.children()[0]).toMatchObject({
    lineHeight: 2,
    textAlign: 'center',
  });
  expect(editor.key(editor.read.children()[0])).toBe(key);
});

it('replaces list semantics when upserting a plain paragraph', () => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, BaseListPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
        indent: 1,
        listType: 'bulleted',
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editor.plugin(BaseParagraphPlugin).update.upsert({}, { select: true });

  expect(editor.read.children()).toEqual([
    { type: 'paragraph', children: [{ text: '' }] },
  ]);
});

it('leaves the caret after a generated inline void insert unless asked to select it', () => {
  const TagPlugin = definePlugin('tagProbe', {
    schema: {
      element: {
        properties: { value: property.string({ required: true }) },
        type: 'tagProbe',
        void: 'inline',
      },
    },
  });
  const setup = (offset = 1) =>
    createEditor({
      plugins: [BaseParagraphPlugin, TagPlugin],
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset },
        focus: { path: [0, 0], offset },
      },
    });
  const typed = setup();

  typed.update((tx) => {
    tx.plugin(TagPlugin).insert({ value: 'x' });
  });

  expect(typed.read.selection()?.focus).toEqual({ offset: 0, path: [0, 2] });

  const atEnd = setup(2);

  atEnd.update((tx) => {
    tx.plugin(TagPlugin).insert({ value: 'x' });
  });
  atEnd.update((tx) => {
    tx.text.insert('z');
  });

  expect(atEnd.read.nodes.get([0, 2])?.[0]).toEqual({ text: 'z' });

  const unselected = setup();

  unselected.update((tx) => {
    tx.plugin(TagPlugin).insert({ value: 'x' }, { select: false });
  });

  expect(unselected.read.selection()?.focus).toEqual({
    offset: 0,
    path: [0, 2],
  });

  const selected = setup();

  selected.update((tx) => {
    tx.plugin(TagPlugin).insert({ value: 'x' }, { select: true });
  });

  expect(selected.read.selection()?.focus.path).toEqual([0, 1, 0]);
});
