/** @jsx jsxt */

import { afterAll, describe, expect, it, mock } from 'bun:test';

import { jsxt, type TestEditor } from '@platejs/test-utils';
import {
  type BaseEditor,
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
  NodeIdPlugin,
} from '@platejs/core';
import { MarkdownPlugin } from '@platejs/markdown';
import { type Element, type ElementEntry, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

jsxt;

const getTableGridAbove = (editor: BaseEditor): ElementEntry[] => {
  const selection = editor.read.selection();
  if (!selection) return [];

  const start = editor.read.nodes.above<Element>({
    at: selection.anchor,
    match: { type: [KEYS.td, KEYS.th] },
  });
  const end = editor.read.nodes.above<Element>({
    at: selection.focus,
    match: { type: [KEYS.td, KEYS.th] },
  });
  if (!start || !end) return [];

  const tablePath = start[1].slice(0, -2);
  const startRow = Math.min(start[1].at(-2)!, end[1].at(-2)!);
  const endRow = Math.max(start[1].at(-2)!, end[1].at(-2)!);
  const startColumn = Math.min(start[1].at(-1)!, end[1].at(-1)!);
  const endColumn = Math.max(start[1].at(-1)!, end[1].at(-1)!);
  const entries: ElementEntry[] = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let column = startColumn; column <= endColumn; column++) {
      const entry = editor.read.nodes.get<Element>([...tablePath, row, column]);
      if (entry) entries.push(entry);
    }
  }

  return entries;
};

mock.module('@platejs/table', () => ({ getTableGridAbove }));

afterAll(() => {
  mock.restore();
});

const TableFixturePlugin = createBasePlugin({
  key: KEYS.table,
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.type(plugins.elementType(TableRowFixturePlugin)),
    },
  }),
});

const TableRowFixturePlugin = createBasePlugin({
  key: KEYS.tr,
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.types(
        plugins.elementTypes([
          TableCellFixturePlugin,
          TableHeaderCellFixturePlugin,
        ])
      ),
    },
  }),
});

const TableCellFixturePlugin = createBasePlugin({
  key: KEYS.td,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent(),
    },
  }),
});

const TableHeaderCellFixturePlugin = createBasePlugin({
  key: KEYS.th,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent(),
    },
  }),
});

const createTestEditor = (input: TestEditor) =>
  createBaseEditor({
    plugins: [
      BaseParagraphPlugin,
      NodeIdPlugin,
      TableFixturePlugin,
      TableRowFixturePlugin,
      TableCellFixturePlugin,
      TableHeaderCellFixturePlugin,
      MarkdownPlugin,
    ],
    selection: input.selection,
    initialValue: input.children,
  });

describe('replacePlaceholders', () => {
  it('replaces prompt and markdown placeholders using real editor markdown', async () => {
    const { getMarkdown } = await import('./getMarkdown');
    const { replacePlaceholders } = await import('./replacePlaceholders');
    const input = (
      <editor>
        <hp>
          Hello <anchor />
          world
          <focus />
        </hp>
        <hp>After</hp>
      </editor>
    ) as TestEditor;
    const editor = createTestEditor(input);
    const expectedBlock = getMarkdown(editor, { type: 'block' });
    const expectedBlockSelection = getMarkdown(editor, {
      type: 'blockSelection',
    });
    const expectedEditor = getMarkdown(editor, { type: 'editor' });

    const result = replacePlaceholders(
      editor,
      [
        'Prompt: {prompt}',
        'Prompt again: {prompt}',
        'Block: {block}',
        'Selection: {blockSelection}',
        'Editor: {editor}',
      ].join('\n'),
      { prompt: 'Refine this' }
    );

    expect(result).toBe(
      [
        'Prompt: Refine this',
        'Prompt again: Refine this',
        `Block: ${expectedBlock}`,
        `Selection: ${expectedBlockSelection}`,
        `Editor: ${expectedEditor}`,
      ].join('\n')
    );
  });

  it('replaces the tableCellWithId placeholder using the table markdown path', async () => {
    const { getMarkdown } = await import('./getMarkdown');
    const { replacePlaceholders } = await import('./replacePlaceholders');
    const input = (
      <editor>
        <htable id="t1">
          <htr id="t1_r1">
            <htd id="t1_r1_c1">
              <hp>
                <anchor />
                Content
                <focus />
              </hp>
            </htd>
            <htd id="t1_r1_c2">
              <hp>Other</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTestEditor(input);
    const expectedTable = getMarkdown(editor, { type: 'tableCellWithId' });

    const result = replacePlaceholders(editor, 'Table:\n{tableCellWithId}');

    expect(result).toBe(`Table:\n${expectedTable}`);
    expect(result).toContain('<CellRef id="t1_r1_c1" />');
    expect(result).toContain('<Cell id="t1_r1_c1">\nContent\n</Cell>');
  });

  it('leaves strings without placeholders unchanged', async () => {
    const { replacePlaceholders } = await import('./replacePlaceholders');
    const editor = createTestEditor(
      (
        <editor>
          <hp>Plain text</hp>
        </editor>
      ) as TestEditor
    );

    expect(replacePlaceholders(editor, 'Nothing to replace here.')).toBe(
      'Nothing to replace here.'
    );
  });
});
