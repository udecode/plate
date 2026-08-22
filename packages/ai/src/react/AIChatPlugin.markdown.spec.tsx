/** @jsx jsxt */

import { describe, expect, it } from 'bun:test';

import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  createEditor,
  createEditorView,
  schema,
  type Value,
} from '@platejs/plite';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { jsxt, type TestEditor } from '@platejs/test-utils';

jsxt;

const createTestEditor = async (input: TestEditor) => {
  const { AIChatPlugin } = await import('./AIChatPlugin');
  const editor = createPlateEditor({
    editor: createEditor<Value>(),
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

describe('AIChatPlugin read.markdown', () => {
  it('keeps request-local comment references attached through moves without ElementIdPlugin', async () => {
    const { AIChatPlugin } = await import('./AIChatPlugin');
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [BaseParagraphPlugin, MarkdownPlugin, AIChatPlugin],
      initialValue: [
        { children: [{ text: 'Current block' }], type: 'paragraph' },
        { children: [{ text: 'Other block' }], type: 'paragraph' },
      ],
    });

    const aiChat = editor.plugin(AIChatPlugin);
    aiChat.store.set({
      _blockRefs: { b1: { key: editor.key([0])! } },
    });
    editor.update.nodes.move({ at: [0], to: [2] });

    expect(
      aiChat.read.commentRange({
        blockRef: 'b1',
        comment: 'Review this',
        content: 'Current block',
      })
    ).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 13, path: [1, 0] },
    });
  });

  describe('tableCellWithRef', () => {
    it('use CellRef placeholder in table and Cell blocks after', async () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>张三</hp>
              </htd>
              <htd>
                <hp>28</hp>
              </htd>
              <htd>
                <hp>北京</hp>
              </htd>
              <htd>
                <hp>工程师</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>李四</hp>
              </htd>
              <htd>
                <hp>34</hp>
              </htd>
              <htd>
                <hp>上海</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />
                  产品经理
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>王五</hp>
              </htd>
              <htd>
                <hp>25</hp>
              </htd>
              <htd>
                <hp>深圳</hp>
              </htd>
              <htd>
                <hp>
                  设计师
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const aiChat = await createTestEditor(input);
      const result = aiChat.read.markdown({
        type: 'tableCellWithRef',
      });
      const cellRefs = [...result.matchAll(/<CellRef ref="([^"]+)" \/>/g)].map(
        (match) => match[1]
      );

      expect(cellRefs).toEqual(['c1', 'c2']);

      const refs = aiChat.store.get('_tableCellRefs');

      expect(Object.keys(refs)).toEqual(cellRefs);
      expect(result).not.toContain(refs.c1.key);
      expect(result).not.toContain(refs.c2.key);

      expect(result).toContain(
        `<Cell ref="${cellRefs[0]}">\n产品经理\n</Cell>`
      );
      expect(result).toContain(`<Cell ref="${cellRefs[1]}">\n设计师\n</Cell>`);

      expect(result).toContain('| 工程师 |');

      aiChat.read.markdown({ type: 'block' });

      expect(aiChat.store.get('_tableCellRefs')).toEqual({});
    });

    it('handle single cell selection', async () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  内容
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>其他</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const aiChat = await createTestEditor(input);
      const result = aiChat.read.markdown({
        type: 'tableCellWithRef',
      });
      const nodeKey = /<CellRef ref="([^"]+)" \/>/.exec(result)?.[1];

      expect(nodeKey).toBeDefined();

      expect(result).toContain(`<Cell ref="${nodeKey}">\n内容\n</Cell>`);
    });

    it('handle cells with multiple paragraphs (multi-block support)', async () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  <anchor />
                  第一行
                </hp>
                <hp>
                  第二行
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const aiChat = await createTestEditor(input);
      const result = aiChat.read.markdown({
        type: 'tableCellWithRef',
      });
      const nodeKey = /<CellRef ref="([^"]+)" \/>/.exec(result)?.[1];

      expect(nodeKey).toBeDefined();

      expect(result).toContain(
        `<Cell ref="${nodeKey}">\n第一行\n\n第二行\n</Cell>`
      );
    });

    it('resolves cell references in the selection named root', async () => {
      const { AIChatPlugin } = await import('./AIChatPlugin');
      const RootHolderPlugin = defineBasePlugin('tableRootHolder', {
        schema: {
          element: {
            blockContent: true,
            contentRoots: {
              body: {
                content: schema.content.type('table', {
                  default: { type: 'table' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
            void: 'block',
          },
        },
      });
      const editor = createPlateEditor({
        editor: createEditor<Value>(),
        plugins: [
          BaseParagraphPlugin,
          BaseTablePlugin,
          BaseTableRowPlugin,
          BaseTableCellPlugin,
          MarkdownPlugin,
          AIChatPlugin,
          RootHolderPlugin,
        ],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0], root: 'header' },
          focus: { offset: 4, path: [0, 0, 0, 0, 0], root: 'header' },
          kind: 'text',
        },
        initialValue: {
          children: [
            {
              childRoots: { body: 'header' },
              children: [{ text: '' }],
              type: 'tableRootHolder',
            },
          ],
          roots: {
            header: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [{ text: 'cell' }],
                            type: 'paragraph',
                          },
                        ],
                        type: 'tableCell',
                      },
                    ],
                    type: 'tableRow',
                  },
                ],
                type: 'table',
              },
            ],
          },
        },
      });
      const aiChat = editor.plugin(AIChatPlugin);
      const result = aiChat.read.markdown({ type: 'tableCellWithRef' });
      const ref = aiChat.store.get('_tableCellRefs').c1;
      const cellKey = createEditorView(editor, {
        root: 'header',
      }).key([0, 0, 0]);

      if (!cellKey) throw new Error('Expected a named-root table cell key');

      expect(result).toContain('<CellRef ref="c1" />');
      expect(ref?.root).toBe('header');
      expect(ref?.key).toBe(cellKey);

      aiChat.update.applyTableCellSuggestion({
        content: 'replacement',
        ref: 'c1',
      });

      expect(
        createEditorView(editor, { root: 'header' }).read.text.string([])
      ).toContain('replacement');
      expect(
        createEditorView(editor, { root: 'header' }).read.nodes.get([
          0, 0, 0, 0,
        ])?.[0]
      ).toMatchObject({ type: 'paragraph' });
    });
  });
});
