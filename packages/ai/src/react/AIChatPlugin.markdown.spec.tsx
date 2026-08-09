/** @jsx jsxt */

import { describe, expect, it } from 'bun:test';

import { jsxt, type TestEditor } from '@platejs/test-utils';
import {
  BaseParagraphPlugin,
  defineBasePlugin,
  ElementIdPlugin,
} from '@platejs/core';
import { MarkdownPlugin } from '@platejs/markdown';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import {
  createEditor,
  createEditorView,
  schema,
  type Value,
} from '@platejs/plite';
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

describe('AIChatPlugin read.markdown', () => {
  it('ignores persisted comment references without ElementIdPlugin', async () => {
    const { AIChatPlugin } = await import('./AIChatPlugin');
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [BaseParagraphPlugin, MarkdownPlugin, AIChatPlugin],
      initialValue: [
        { children: [{ text: 'Current block' }], type: 'paragraph' },
      ],
    });

    expect(
      editor.plugin(AIChatPlugin).read.commentRange({
        blockId: 'persisted-block-id',
        comment: 'Review this',
        content: 'Current block',
      })
    ).toBeUndefined();
  });

  describe('tableCellWithId', () => {
    it('use CellRef placeholder in table and Cell blocks after', async () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
                <hp>张三</hp>
              </htd>
              <htd id="t1_r1_c2">
                <hp>28</hp>
              </htd>
              <htd id="t1_r1_c3">
                <hp>北京</hp>
              </htd>
              <htd id="t1_r1_c4">
                <hp>工程师</hp>
              </htd>
            </htr>
            <htr id="t1_r2">
              <htd id="t1_r2_c1">
                <hp>李四</hp>
              </htd>
              <htd id="t1_r2_c2">
                <hp>34</hp>
              </htd>
              <htd id="t1_r2_c3">
                <hp>上海</hp>
              </htd>
              <htd id="t1_r2_c4">
                <hp>
                  <anchor />
                  产品经理
                </hp>
              </htd>
            </htr>
            <htr id="t1_r3">
              <htd id="t1_r3_c1">
                <hp>王五</hp>
              </htd>
              <htd id="t1_r3_c2">
                <hp>25</hp>
              </htd>
              <htd id="t1_r3_c3">
                <hp>深圳</hp>
              </htd>
              <htd id="t1_r3_c4">
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
        type: 'tableCellWithId',
      });
      const cellRefs = [...result.matchAll(/<CellRef id="([^"]+)" \/>/g)].map(
        (match) => match[1]!
      );

      expect(cellRefs).toEqual(['c1', 'c2']);

      const refs = aiChat.store.get('_tableCellRefs');

      expect(Object.keys(refs)).toEqual(cellRefs);
      expect(result).not.toContain(refs.c1!.key);
      expect(result).not.toContain(refs.c2!.key);

      expect(result).toContain(`<Cell id="${cellRefs[0]}">\n产品经理\n</Cell>`);
      expect(result).toContain(`<Cell id="${cellRefs[1]}">\n设计师\n</Cell>`);

      expect(result).not.toContain('t1_r2_c4');
      expect(result).toContain('| 工程师 |');

      aiChat.read.markdown({ type: 'block' });

      expect(aiChat.store.get('_tableCellRefs')).toEqual({});
    });

    it('handle single cell selection', async () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
                <hp>
                  <anchor />
                  内容
                  <focus />
                </hp>
              </htd>
              <htd id="t1_r1_c2">
                <hp>其他</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const aiChat = await createTestEditor(input);
      const result = aiChat.read.markdown({
        type: 'tableCellWithId',
      });
      const nodeKey = /<CellRef id="([^"]+)" \/>/.exec(result)?.[1];

      expect(nodeKey).toBeDefined();

      expect(result).toContain(`<Cell id="${nodeKey}">\n内容\n</Cell>`);

      expect(result).not.toContain('t1_r1_c1');
    });

    it('handle cells with multiple paragraphs (multi-block support)', async () => {
      const input = (
        <editor>
          <htable id="t1">
            <htr id="t1_r1">
              <htd id="t1_r1_c1">
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
        type: 'tableCellWithId',
      });
      const nodeKey = /<CellRef id="([^"]+)" \/>/.exec(result)?.[1];

      expect(nodeKey).toBeDefined();

      expect(result).toContain(
        `<Cell id="${nodeKey}">\n第一行\n\n第二行\n</Cell>`
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
          ElementIdPlugin,
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
                            id: 'cell-paragraph',
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
      const result = aiChat.read.markdown({ type: 'tableCellWithId' });
      const ref = aiChat.store.get('_tableCellRefs').c1;
      const cellKey = createEditorView(editor, { root: 'header' }).key([
        0, 0, 0,
      ]);

      if (!cellKey) throw new Error('Expected a named-root table cell key');

      expect(result).toContain('<CellRef id="c1" />');
      expect(ref?.root).toBe('header');
      expect(ref?.key).toBe(cellKey);

      aiChat.update.applyTableCellSuggestion({
        content: 'replacement',
        id: 'c1',
      });

      expect(
        createEditorView(editor, { root: 'header' }).read.text.string([])
      ).toContain('replacement');
      expect(
        createEditorView(editor, { root: 'header' }).read.nodes.get([
          0, 0, 0, 0,
        ])?.[0]
      ).toMatchObject({ id: 'cell-paragraph' });
    });
  });
});
