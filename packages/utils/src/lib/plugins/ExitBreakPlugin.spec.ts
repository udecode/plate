import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
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
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
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
      initialValue: [{ children: [{ text: 'start' }], type: 'paragraph' }],
    });

    editor.plugin(ExitBreakPlugin).update.insertBefore({ match: () => true });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'start' }], type: 'paragraph' },
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
      initialValue: [{ children: [{ text: 'start' }], type: 'paragraph' }],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'start' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits after the nearest ancestor whose parent accepts a paragraph', () => {
    const CodeLinePlugin = defineBasePlugin('codeline', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const CodeBlockPlugin = defineBasePlugin('codeblock', {
      schema: {
        element: {
          content: schema.content.element(CodeLinePlugin, { min: 1 }),
        },
      },
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
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits after an outer structure whose grammar rejects paragraphs', () => {
    const TableCellPlugin = defineBasePlugin('tableCell', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
    });
    const TableRowPlugin = defineBasePlugin('tableRow', {
      schema: {
        element: {
          content: schema.content.element(TableCellPlugin, { min: 1 }),
        },
      },
    });
    const TablePlugin = defineBasePlugin('table', {
      schema: {
        element: {
          content: schema.content.element(TableRowPlugin, { min: 1 }),
        },
      },
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
                  children: [
                    { children: [{ text: 'cell' }], type: 'paragraph' },
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
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'cell' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });
});
