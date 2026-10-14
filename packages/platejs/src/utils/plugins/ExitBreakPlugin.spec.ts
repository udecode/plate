import { BaseParagraphPlugin, createEditorView, definePlugin } from 'platejs';
import { createEditor } from 'platejs/react';

import { schema } from '../../core';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
} from '../../features/basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseCodeBlockPlugin } from '../../features/code-block/lib/BaseCodeBlockPlugin';
import { BaseColumnPlugin } from '../../features/layout/lib/BaseColumnPlugin';
import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('inserts an exit block after the current block', () => {
    const editor = createEditor({
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
    const editor = createEditor({
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
    const editor = createEditor({
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

  it('exits a top-level code block with the root default block', () => {
    const CodeBlockPlugin = definePlugin('codeblock', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1, max: 1 }),
        },
      },
    });
    const editor = createEditor({
      plugins: [ExitBreakPlugin, CodeBlockPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'code' }],
          type: 'codeblock',
        },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'code' }],
        type: 'codeblock',
      },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits a code block inside a column without leaving the column [EDIT-GLOBAL-001]', () => {
    const editor = createEditor({
      plugins: [ExitBreakPlugin, BaseCodeBlockPlugin, BaseColumnPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 1, 0, 0] },
        focus: { offset: 4, path: [0, 1, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ children: [{ text: 'left' }], type: 'paragraph' }],
              type: 'column',
              width: '50%',
            },
            {
              children: [{ children: [{ text: 'code' }], type: 'codeBlock' }],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'columnGroup',
        },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ children: [{ text: 'left' }], type: 'paragraph' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [
              { children: [{ text: 'code' }], type: 'codeBlock' },
              { children: [{ text: '' }], type: 'paragraph' },
            ],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'columnGroup',
      },
    ]);
  });

  it('exits the table, not a cell or row its parent creates by default', () => {
    const TableCellPlugin = definePlugin('tableCell', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
    });
    const TableRowPlugin = definePlugin('tableRow', {
      schema: {
        element: {
          content: schema.content.element(TableCellPlugin, { min: 1 }),
        },
      },
    });
    const TablePlugin = definePlugin('table', {
      schema: {
        element: {
          content: schema.content.element(TableRowPlugin, { min: 1 }),
        },
      },
    });
    const editor = createEditor({
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

  it('lands the body default after a divider in a root that requires a leading heading', () => {
    const editor = createEditor({
      plugins: [ExitBreakPlugin, BaseHeadingPlugin, BaseHorizontalRulePlugin],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'Title' }], level: 1, type: 'heading' },
        { children: [{ text: '' }], type: 'horizontalRule' },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      { children: [{ text: '' }], type: 'horizontalRule' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits one container level in a root that requires a leading heading', () => {
    const BoxPlugin = definePlugin('box', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, BaseBlockquotePlugin],
            { min: 1 }
          ),
        },
      },
    });
    const editor = createEditor({
      plugins: [
        ExitBreakPlugin,
        BaseHeadingPlugin,
        BaseBlockquotePlugin,
        BoxPlugin,
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [1, 0, 0, 0] },
        focus: { offset: 1, path: [1, 0, 0, 0] },
      },
      initialValue: [
        { children: [{ text: 'Title' }], level: 1, type: 'heading' },
        {
          children: [
            {
              children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
              type: 'blockquote',
            },
          ],
          type: 'box',
        },
      ],
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      {
        children: [
          {
            children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
            type: 'blockquote',
          },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'box',
      },
    ]);
  });

  it('changes nothing when the container declares no default block', () => {
    const BinPlugin = definePlugin('bin', {
      schema: { element: { content: schema.content.group('block') } },
    });
    const initialValue = [
      {
        children: [
          {
            children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
            type: 'blockquote',
          },
        ],
        type: 'bin',
      },
    ];
    const editor = createEditor({
      plugins: [ExitBreakPlugin, BaseBlockquotePlugin, BinPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0] },
      },
      initialValue,
    });

    editor.plugin(ExitBreakPlugin).update.insert();

    expect(editor.read.children()).toEqual(initialValue);
  });

  it('changes nothing and still takes the key when the container is full', () => {
    const BoxPlugin = definePlugin('box', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, BaseBlockquotePlugin],
            { min: 1, max: 1 }
          ),
        },
      },
    });
    const initialValue = [
      {
        children: [
          {
            children: [{ children: [{ text: 'x' }], type: 'paragraph' }],
            type: 'blockquote',
          },
        ],
        type: 'box',
      },
    ];
    const editor = createEditor({
      plugins: [ExitBreakPlugin, BaseBlockquotePlugin, BoxPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0] },
      },
      initialValue,
    });

    const handled = editor.plugin(ExitBreakPlugin).update.insert();

    expect({ children: editor.read.children(), handled }).toEqual({
      children: initialValue,
      handled: true,
    });
  });

  it('inserts and undoes inside the active named root', () => {
    const RootHolderPlugin = definePlugin('exitBreakRootHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.type(BaseParagraphPlugin.name, {
                default: { type: BaseParagraphPlugin.name },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      plugins: [ExitBreakPlugin, RootHolderPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0], root: 'header' },
        focus: { offset: 4, path: [0, 0], root: 'header' },
      },
      initialValue: {
        children: [
          {
            childRoots: { body: 'header' },
            children: [{ text: '' }],
            type: RootHolderPlugin.name,
          },
        ],
        roots: {
          header: [
            { children: [{ text: 'head' }], type: BaseParagraphPlugin.name },
          ],
        },
      },
    });
    const header = createEditorView(editor, { root: 'header' });

    header.plugin(ExitBreakPlugin).update.insert();

    expect(header.read.children()).toEqual([
      { children: [{ text: 'head' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    expect(editor.read.children()).toHaveLength(1);

    editor.api.history.undo();

    expect(header.read.children()).toEqual([
      { children: [{ text: 'head' }], type: 'paragraph' },
    ]);
  });
});
