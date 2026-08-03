import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { createEditor, target, type Value } from '@platejs/plite';

import { BaseTablePlugin } from '../lib/BaseTablePlugin';
import { TableV54MigrationPlugin } from './TableV54MigrationPlugin';

const TestRootPlugin = defineBasePlugin('testRoot', {
  schema: ({ name, plugins }) => ({
    contentRoots: [
      {
        content: plugins.blockContent(),
        ownership: 'exclusive',
        slot: name,
        target: target.element(name),
      },
    ],
    element: { void: 'block' },
  }),
});

const legacyTable = (text: string) => ({
  children: [
    {
      children: [
        {
          children: [{ children: [{ text }], type: 'paragraph' }],
          type: 'tableCellHeader',
        },
      ],
      type: 'tableRow',
    },
  ],
  type: 'table',
});

describe('TableV54MigrationPlugin', () => {
  it('migrates legacy header cells before schema fitting', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      nodeId: false,
      plugins: [TableV54MigrationPlugin, BaseTablePlugin],
      initialValue: [legacyTable('Header')],
    });

    expect(editor.read.children()[0]).toEqual({
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Header' }], type: 'paragraph' }],
              header: true,
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    });
  });

  it('migrates primary and named roots during deferred loads', () => {
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      nodeId: false,
      plugins: [TableV54MigrationPlugin, BaseTablePlugin, TestRootPlugin],
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [
        legacyTable('Main'),
        {
          childRoots: { testRoot: 'notes' },
          children: [{ text: '' }],
          type: 'testRoot',
        },
      ],
      roots: { notes: [legacyTable('Root')] },
    });

    expect(editor.read.children()[0]).toHaveProperty(
      'children.0.children.0.header',
      true
    );
    expect(editor.read.value().roots?.notes?.[0]).toHaveProperty(
      'children.0.children.0.header',
      true
    );
  });

  it('preserves canonical documents', () => {
    const canonical = {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Cell' }], type: 'paragraph' }],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    } as const;
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      nodeId: false,
      plugins: [TableV54MigrationPlugin, BaseTablePlugin],
      initialValue: [canonical],
    });

    expect(editor.read.children()).toEqual([canonical]);
  });
});
