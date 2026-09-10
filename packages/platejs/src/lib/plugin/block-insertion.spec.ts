import { expect, it } from 'bun:test';

import { createEditor, type Editor } from '../../core';
import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
} from '../../features/basic-nodes';
import { BaseCalloutPlugin } from '../../features/callout';
import { BaseDetailsPlugin } from '../../features/details';
import { BaseColumnPlugin } from '../../features/layout';
import { BaseImagePlugin, BasePlaceholderPlugin } from '../../features/media';
import { BaseTablePlugin } from '../../features/table';
import { BaseTocPlugin } from '../../features/toc';
import { BaseEquationPlugin } from '../../math';

const plugins = [
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseCalloutPlugin,
  BaseDetailsPlugin,
  BaseColumnPlugin,
  BaseImagePlugin,
  BasePlaceholderPlugin,
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
        .update.insert({ level: 2 }, { replaceEmpty: true, select: true }),
  },
  {
    type: 'blockquote',
    insert: (editor) =>
      editor
        .plugin(BaseBlockquotePlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'horizontalRule',
    insert: (editor) =>
      editor
        .plugin(BaseHorizontalRulePlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'callout',
    insert: (editor) =>
      editor
        .plugin(BaseCalloutPlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'details',
    insert: (editor) =>
      editor
        .plugin(BaseDetailsPlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'columnGroup',
    insert: (editor) =>
      editor
        .plugin(BaseColumnPlugin)
        .update.insert({ columns: 3 }, { replaceEmpty: true, select: true }),
  },
  {
    type: 'image',
    insert: (editor) =>
      editor
        .plugin(BaseImagePlugin)
        .update.insert(
          { url: 'https://example.com/image.png' },
          { replaceEmpty: true, select: true }
        ),
  },
  {
    type: 'placeholder',
    insert: (editor) =>
      editor
        .plugin(BasePlaceholderPlugin)
        .update.insert(
          { mediaType: 'video' },
          { replaceEmpty: true, select: true }
        ),
  },
  {
    type: 'table',
    insert: (editor) =>
      editor
        .plugin(BaseTablePlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'toc',
    insert: (editor) =>
      editor
        .plugin(BaseTocPlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
  },
  {
    type: 'equation',
    insert: (editor) =>
      editor
        .plugin(BaseEquationPlugin)
        .update.insert({}, { replaceEmpty: true, select: true }),
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
      editor.update.history.undo();
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
  editor
    .plugin(BaseTablePlugin)
    .update.insert({}, { replaceEmpty: true, select: true });
  editor
    .plugin(BaseTablePlugin)
    .update.insert({}, { replaceEmpty: true, select: true });
  expect(editor.read.children().map((n) => n.type)).toEqual(['table', 'table']);
  expect(editor.read.selection()?.anchor.path).toEqual([1, 0, 0, 0, 0]);
});
