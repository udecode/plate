/** @jsx jsxt */

import { describe, expect, it } from 'bun:test';

import { jsxt, type TestEditor } from '@platejs/test-utils';
import { BaseParagraphPlugin, ElementIdPlugin } from '@platejs/core';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { createEditor, type Value } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

jsxt;

const createTestEditor = async (input: TestEditor) => {
  const { AIChatPlugin } = await import('./AIChatPlugin');
  const editor = createPlateEditor({
    editor: createEditor<Value>(),
    plugins: [
      BaseParagraphPlugin,
      ElementIdPlugin,
      BaseTablePlugin,
      BaseTableRowPlugin,
      BaseTableCellPlugin,
      MarkdownPlugin,
      AIChatPlugin,
    ],
    selection: input.selection,
    initialValue: input.children,
  });

  return editor.plugin(AIChatPlugin);
};

describe('AIChatPlugin read.resolvePlaceholders', () => {
  it('replaces prompt and markdown placeholders using real editor markdown', async () => {
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
    const aiChat = await createTestEditor(input);
    const expectedBlock = aiChat.read.markdown({ type: 'block' });
    const expectedBlockSelection = aiChat.read.markdown({
      type: 'blockSelection',
    });
    const expectedEditor = aiChat.read.markdown({ type: 'editor' });

    const result = aiChat.read.resolvePlaceholders(
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
    const aiChat = await createTestEditor(input);
    const expectedTable = aiChat.read.markdown({
      type: 'tableCellWithId',
    });

    const result = aiChat.read.resolvePlaceholders('Table:\n{tableCellWithId}');
    const nodeKey = /<CellRef id="([^"]+)" \/>/.exec(result)?.[1];

    expect(result).toBe(`Table:\n${expectedTable}`);
    expect(nodeKey).toBeDefined();
    expect(result).toContain(`<Cell id="${nodeKey}">\nContent\n</Cell>`);
  });

  it('leaves strings without placeholders unchanged', async () => {
    const aiChat = await createTestEditor(
      (
        <editor>
          <hp>Plain text</hp>
        </editor>
      ) as TestEditor
    );

    expect(aiChat.read.resolvePlaceholders('Nothing to replace here.')).toBe(
      'Nothing to replace here.'
    );
  });
});
