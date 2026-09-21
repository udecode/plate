import { expect, it } from 'bun:test';

import { createEditor, type Editor } from '../../core';
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
import { BaseDetailsPlugin } from '../../features/details';
import { BaseColumnPlugin } from '../../features/layout';
import { BaseListPlugin } from '../../features/list';
import { BaseUploadPlugin } from '../../features/upload';
import { BaseImagePlugin } from '../../features/media';
import { BaseTablePlugin } from '../../features/table';
import { BaseTocPlugin } from '../../features/toc';
import { BaseEquationPlugin } from '../../math';
import { BaseParagraphPlugin } from '../plugins/paragraph';

const plugins = [
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseCalloutPlugin,
  BaseDetailsPlugin,
  BaseColumnPlugin,
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
        .plugin(BaseColumnPlugin)
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
            .store.get('isOpen', editor.key([text ? 1 : 0])!)
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

  upsertEditor
    .plugin(BaseHeadingPlugin)
    .update.upsert({ level: 2 }, { select: true });
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

  upsertEditor
    .plugin(BaseListPlugin)
    .update.upsert({ type: 'bulleted' }, { select: true });
  expect(upsertEditor.read.children()).toHaveLength(1);
  expect(upsertEditor.key(upsertEditor.read.children()[0])).toBe(key);
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
