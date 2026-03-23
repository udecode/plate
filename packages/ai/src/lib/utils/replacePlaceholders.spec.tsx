/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import {
  BaseParagraphPlugin,
  type SlateEditor,
  createSlateEditor,
} from 'platejs';

import { getMarkdown } from './getMarkdown';
import { replacePlaceholders } from './replacePlaceholders';

jsxt;

const createTestEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseTablePlugin,
      BaseTableRowPlugin,
      BaseTableCellPlugin,
      BaseTableCellHeaderPlugin,
      MarkdownPlugin,
    ],
    selection: input.selection,
    value: input.children,
  });

describe('replacePlaceholders', () => {
  it('replaces prompt and markdown placeholders using real editor markdown', () => {
    const input = (
      <editor>
        <hp>
          Hello <anchor />
          world
          <focus />
        </hp>
        <hp>After</hp>
      </editor>
    ) as any as SlateEditor;
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

  it('replaces the tableCellWithId placeholder using the table markdown path', () => {
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
    ) as any as SlateEditor;
    const editor = createTestEditor(input);
    const expectedTable = getMarkdown(editor, { type: 'tableCellWithId' });

    const result = replacePlaceholders(editor, 'Table:\n{tableCellWithId}');

    expect(result).toBe(`Table:\n${expectedTable}`);
    expect(result).toContain('<CellRef id="t1_r1_c1" />');
    expect(result).toContain('<Cell id="t1_r1_c1">\nContent\n</Cell>');
  });

  it('leaves strings without placeholders unchanged', () => {
    const editor = createTestEditor(
      (
        <editor>
          <hp>Plain text</hp>
        </editor>
      ) as any as SlateEditor
    );

    expect(replacePlaceholders(editor, 'Nothing to replace here.')).toBe(
      'Nothing to replace here.'
    );
  });
});
