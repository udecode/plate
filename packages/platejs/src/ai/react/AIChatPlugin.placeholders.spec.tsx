/** @jsx jsxt */

import { describe, expect, it } from 'bun:test';

import { jsxt, type TestEditor } from '#platejs-test-internal';

import { BaseParagraphPlugin } from '../../core';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../features/table';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';

jsxt;

const createTestEditor = async (input: TestEditor) => {
  const { AIChatPlugin } = await import('./AIChatPlugin');
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
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
    const expectedNodeSelection = aiChat.read.markdown({
      type: 'nodeSelection',
    });
    const expectedEditor = aiChat.read.markdown({ type: 'editor' });

    const result = aiChat.read.resolvePlaceholders(
      [
        'Prompt: {prompt}',
        'Prompt again: {prompt}',
        'Block: {block}',
        'Selection: {nodeSelection}',
        'Editor: {editor}',
      ].join('\n'),
      { prompt: 'Refine this' }
    );

    expect(result).toBe(
      [
        'Prompt: Refine this',
        'Prompt again: Refine this',
        `Block: ${expectedBlock}`,
        `Selection: ${expectedNodeSelection}`,
        `Editor: ${expectedEditor}`,
      ].join('\n')
    );
  });

  it('replaces the tableCellWithRef placeholder using the table markdown path', async () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                Content
                <focus />
              </hp>
            </htd>
            <htd>
              <hp>Other</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const aiChat = await createTestEditor(input);
    const expectedTable = aiChat.read.markdown({
      type: 'tableCellWithRef',
    });

    const result = aiChat.read.resolvePlaceholders(
      'Table:\n{tableCellWithRef}'
    );
    const nodeKey = /<CellRef ref="([^"]+)" \/>/.exec(result)?.[1];

    expect(result).toBe(`Table:\n${expectedTable}`);
    expect(nodeKey).toBeDefined();
    expect(result).toContain(`<Cell ref="${nodeKey}">\nContent\n</Cell>`);
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
