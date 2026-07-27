import { BaseParagraphPlugin, createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { schema } from '@platejs/plite';

import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('inserts an exit block after the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('inserts an exit block before the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.plugin(ExitBreakPlugin).update.insertBefore({ match: () => true });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'start' }], type: 'p' },
    ]);
  });

  it('routes insert through the Plite runtime transform', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('exits after the nearest ancestor whose parent accepts a paragraph', () => {
    const CodeLinePlugin = createBasePlugin({
      key: 'codeline',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'codeline',
    });
    const CodeBlockPlugin = createBasePlugin({
      key: 'codeblock',
      schema: ({ plugins }) => {
        const codeLineType = plugins.elementType(CodeLinePlugin);

        return {
          element: {
            content: schema.content.type(codeLineType, {
              default: { type: codeLineType },
              min: 1,
            }),
          },
        };
      },
      type: 'codeblock',
    });
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin, CodeBlockPlugin, CodeLinePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: 'code' }], type: 'codeline' }],
          type: 'codeblock',
        },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: 'code' }], type: 'codeline' }],
        type: 'codeblock',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('exits after an outer structure whose grammar rejects paragraphs', () => {
    const TableCellPlugin = createBasePlugin({
      key: 'td',
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: { type: plugins.elementType(BaseParagraphPlugin) },
            min: 1,
          }),
        },
      }),
      type: 'td',
    });
    const TableRowPlugin = createBasePlugin({
      key: 'tr',
      schema: ({ plugins }) => {
        const cellType = plugins.elementType(TableCellPlugin);

        return {
          element: {
            content: schema.content.type(cellType, {
              default: { type: cellType },
              min: 1,
            }),
          },
        };
      },
      type: 'tr',
    });
    const TablePlugin = createBasePlugin({
      key: 'table',
      schema: ({ plugins }) => {
        const rowType = plugins.elementType(TableRowPlugin);

        return {
          element: {
            content: schema.content.type(rowType, {
              default: { type: rowType },
              min: 1,
            }),
          },
        };
      },
      type: 'table',
    });
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin, TablePlugin, TableRowPlugin, TableCellPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'cell' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'cell' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
