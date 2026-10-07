import assert from 'node:assert/strict';

import {
  BaseParagraphPlugin,
  createEditor as createRuntimeEditor,
  definePlugin,
  type Element,
  ElementApi,
  NodeApi,
  schema,
  type Selection,
  PLUGINS,
} from '../../../core';
import {
  ColumnItemPlugin,
  ColumnPlugin,
} from '../../../react/features/layout/ColumnPlugin';
import { BaseIndentPlugin } from '../../indent';
import { BaseListPlugin, ListType } from '../../list/lib/BaseListPlugin';
import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
  type ColumnElement,
  type ColumnGroupElement,
} from './BaseColumnPlugin';

const columnPlugins = [BaseColumnPlugin] as const;
const TestColumnHostPlugin = definePlugin('testColumnHost', {
  dependencies: [BaseColumnItemPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseColumnItemPlugin, { min: 1 }),
    },
  },
});

type ColumnNode = Omit<ColumnElement, 'children'> & {
  children: readonly Element[];
};
type ColumnGroupNode = Omit<ColumnGroupElement, 'children'> & {
  children: readonly ColumnNode[];
};
type ColumnValue = readonly Element[];

const isColumnGroupNode = (node: unknown): node is ColumnGroupNode =>
  ElementApi.isElement(node) &&
  node.type === 'columnGroup' &&
  node.children.every(
    (child) =>
      ElementApi.isElement(child) &&
      child.type === 'column' &&
      typeof child.width === 'string'
  );

describe('BaseColumnPlugin schema', () => {
  it('declares the item as an exact required Base and React dependency', () => {
    expect(BaseColumnItemPlugin.dependencies).toEqual([BaseParagraphPlugin]);
    expect(BaseColumnPlugin.dependencies).toEqual([BaseColumnItemPlugin]);
    expect(ColumnPlugin.dependencies).toEqual([ColumnItemPlugin]);
  });

  it('rejects a disabled required column-item dependency', () => {
    expect(() =>
      createRuntimeEditor({
        plugins: [
          BaseColumnPlugin,
          BaseColumnItemPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(/columnGroup.*disabled.*column|column.*disabled.*columnGroup/i);
  });

  it('keeps the column item independently installable', () => {
    expect(() =>
      createRuntimeEditor({
        plugins: [TestColumnHostPlugin],
        initialValue: [
          {
            children: [
              {
                children: [
                  { children: [{ text: 'Independent' }], type: 'paragraph' },
                ],
                type: 'column',
                width: '50%',
              },
            ],
            type: 'testColumnHost',
          },
        ],
      })
    ).not.toThrow();
  });

  it('constructs configured column-group content from plugin-name grammar', () => {
    const editor = createRuntimeEditor({
      plugins: [BaseColumnPlugin],
    });

    expect(editor.read.schema.create(BaseColumnPlugin)).toEqual({
      children: [
        {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          type: 'column',
          width: '50%',
        },
        {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          type: 'column',
          width: '50%',
        },
      ],
      type: 'columnGroup',
    });
    expect(editor.read.schema.element(BaseColumnPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.element(BaseColumnItemPlugin)?.groups).toContain(
      'block'
    );
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            type: 'column',
            width: '50%',
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.assertFragment([
        {
          children: [
            { children: [{ text: '' }], type: 'paragraph' },
            { children: [{ text: '' }], type: 'paragraph' },
          ],
          type: 'columnGroup',
        },
      ])
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.assertFragment([
        {
          children: [
            {
              children: [{ children: [{ text: '' }], type: 'paragraph' }],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'columnGroup',
        },
      ])
    ).toThrow(/at least 2 children/i);
  });
});

{
  const twoColumns: ColumnValue = [
    {
      children: [
        {
          children: [
            { children: [{ text: 'Column 1 text' }], type: 'paragraph' },
          ],
          type: 'column',
          width: '50%',
        },
        {
          children: [
            { children: [{ text: 'Column 2 text' }], type: 'paragraph' },
          ],
          type: 'column',
          width: '50%',
        },
      ],
      type: 'columnGroup',
    },
  ];

  const createEditor = ({
    selection,
    value = twoColumns,
  }: {
    selection?: Selection;
    value?: ColumnValue;
  } = {}) =>
    createRuntimeEditor({
      plugins: columnPlugins,
      selection,
      initialValue: value,
    });

  const getColumnGroup = (editor: ReturnType<typeof createEditor>) => {
    const entry = editor.read.nodes.get([0], { match: isColumnGroupNode });

    assert.ok(entry);

    return entry[0];
  };

  describe('BaseColumnPlugin update', () => {
    describe('insert', () => {
      it('inserts a column with the schema width and normalizes the group', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'First' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '34%',
                },
                {
                  children: [
                    { children: [{ text: 'Second' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '33%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        editor.plugin(BaseColumnItemPlugin).update.insert({}, { at: [0, 2] });

        const columnGroup = getColumnGroup(editor);

        expect(columnGroup.children).toHaveLength(3);
        expect(columnGroup.children[2].type).toBe('column');
        expect(columnGroup.children[2].width).toBe('42.73504273504273%');
        expect(columnGroup.children[0].width).toBe('29.05982905982906%');
        expect(columnGroup.children[2].children[0]).toMatchObject({
          type: 'paragraph',
        });
      });

      it('respects a custom width and insertion path', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'Existing' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [
                    { children: [{ text: 'Second' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '25%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        editor
          .plugin(BaseColumnItemPlugin)
          .update.insert({ width: '25%' }, { at: [0, 0] });

        const columnGroup = getColumnGroup(editor);

        expect(columnGroup.children).toHaveLength(3);
        expect(columnGroup.children[0].width).toBe('25%');
        expect(columnGroup.children[1].width).toBe('50%');
        expect(editor.read.text.string([0, 0])).toBe('');
        expect(editor.read.text.string([0, 1])).toBe('Existing');
      });
    });

    describe('insertGroup', () => {
      it('inserts evenly sized columns', () => {
        const editor = createEditor({
          value: [{ children: [{ text: 'Before' }], type: 'paragraph' }],
        });

        editor
          .plugin(BaseColumnPlugin)
          .update.insert({ columns: 3 }, { at: [1] });

        const entry = editor.read.nodes.get([1], {
          match: isColumnGroupNode,
        });

        assert.ok(entry);
        expect(BaseColumnPlugin.name).toBe('columnGroup');
        expect(BaseColumnPlugin.name).toBe(PLUGINS.columnGroup);
        expect(entry[0].type).toBe(editor.plugin(BaseColumnPlugin).schema.type);
        expect(entry[0].children).toHaveLength(3);
        expect(entry[0].children[0].width).toContain('33.3333');
        expect(entry[0].children[1].width).toContain('33.3333');
        expect(entry[0].children[2].width).toContain('33.3333');
        expect(entry[0].children[0].children[0]).toMatchObject({
          type: 'paragraph',
        });
      });

      it('selects the first inserted block when asked', () => {
        const editor = createEditor({
          value: [{ children: [{ text: 'Before' }], type: 'paragraph' }],
        });

        editor.update.columnGroup.insert(
          { columns: 2 },
          { at: [1], select: true }
        );

        expect(editor.read.nodes.block()?.[1]).toEqual([1, 0, 0]);
      });
    });

    describe('moveMiddle', () => {
      it('merges a non-empty middle column into the first column', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'Left' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [
                    { children: [{ text: 'Middle' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [
                    { children: [{ text: 'Right' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });
        const entry = editor.read.nodes.get([0], {
          match: ElementApi.isElement,
        });

        assert.ok(entry);
        editor.update.column.moveMiddle(entry, { direction: 'left' });

        expect(getColumnGroup(editor).children).toHaveLength(2);
        expect(editor.read.text.string([0, 0])).toBe('LeftMiddle');
        expect(editor.read.text.string([0, 1])).toBe('Right');
      });

      it('removes an empty middle column and reports failure', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'Left' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: '' }], type: 'paragraph' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [
                    { children: [{ text: 'Right' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });
        const entry = editor.read.nodes.get([0], {
          match: ElementApi.isElement,
        });

        assert.ok(entry);
        expect(
          editor.update.column.moveMiddle(entry, { direction: 'left' })
        ).toBe(false);
        expect(getColumnGroup(editor).children).toHaveLength(2);
        expect(editor.read.text.string([0, 0])).toBe('Left');
        expect(editor.read.text.string([0, 1])).toBe('Right');
      });
    });

    describe('selectAll', () => {
      it('selects the containing column and then its parent group', () => {
        const editor = createEditor({
          selection: {
            kind: 'text',
            anchor: { offset: 1, path: [0, 0, 0, 0] },
            focus: { offset: 1, path: [0, 0, 0, 0] },
          },
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'abc' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [
                    { children: [{ text: 'def' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '50%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        expect(editor.update.column.selectAll()).toBe(true);
        expect(editor.read.selection()).toEqual({
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 0, 0, 0] },
        });
        expect(editor.update.column.selectAll()).toBe(true);
        expect(editor.read.selection()).toEqual({
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 1, 0, 0] },
        });
      });

      it('expands a backward full-column selection to the group', () => {
        const editor = createEditor({
          selection: {
            kind: 'text',
            anchor: { offset: 3, path: [0, 0, 0, 0] },
            focus: { offset: 0, path: [0, 0, 0, 0] },
          },
          value: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'abc' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [
                    { children: [{ text: 'def' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '50%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        expect(editor.update.column.selectAll()).toBe(true);
        expect(editor.read.selection()).toEqual({
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 1, 0, 0] },
        });
      });
    });

    describe('set', () => {
      it('updates widths without changing content', () => {
        const editor = createEditor();

        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['30%', '70%'],
        });

        expect(
          getColumnGroup(editor).children.map((column) => column.width)
        ).toEqual(['30%', '70%']);
        expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
        expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
      });

      it('adds empty columns while preserving content', () => {
        const editor = createEditor();

        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['33%', '33%', '34%'],
        });

        expect(
          getColumnGroup(editor).children.map((column) => column.width)
        ).toEqual(['33%', '33%', '34%']);
        expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
        expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
        expect(editor.read.text.string([0, 2])).toBe('');
      });

      it.each([6, 7, 11, 12])(
        'settles widths that cannot sum to exactly one hundred at %i columns',
        (columns) => {
          const editor = createEditor();

          editor.update.columnGroup.setColumns({ at: [0], columns });

          const widths = getColumnGroup(editor).children.map((column) =>
            Number.parseFloat(column.width)
          );

          expect(widths).toHaveLength(columns);
          expect(
            Math.abs(widths.reduce((sum, width) => sum + width, 0) - 100)
          ).toBeLessThan(0.1);
        }
      );

      it('merges removed content into the last kept column', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'C' }], type: 'paragraph' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'D' }], type: 'paragraph' }],
                  type: 'column',
                  width: '25%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['50%', '50%'],
        });

        expect(getColumnGroup(editor).children).toHaveLength(2);
        expect(editor.read.text.string([0, 0])).toBe('A');
        expect(editor.read.text.string([0, 1])).toBe('BCD');
      });

      it('preserves content across repeated count changes', () => {
        const editor = createEditor();

        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['33%', '33%', '34%'],
        });
        editor.update.nodes.insert(
          { children: [{ text: 'Column 3 text' }], type: 'paragraph' },
          { at: [0, 2, 1] }
        );
        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['50%', '50%'],
        });
        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['33%', '33%', '34%'],
        });

        expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
        expect(editor.read.text.string([0, 1])).toBe(
          'Column 2 textColumn 3 text'
        );
        expect(editor.read.text.string([0, 2])).toBe('');
      });

      it('does nothing without a valid target or widths', () => {
        const editor = createEditor();

        editor.update.columnGroup.setColumns({ widths: ['100%'] });
        editor.update.columnGroup.setColumns({
          at: [999],
          widths: ['100%'],
        });
        editor.update.columnGroup.setColumns({ at: [0], widths: [] });

        expect(editor.read.children()).toEqual(twoColumns);
      });

      it('normalizes widths through the group correction', () => {
        const editor = createEditor();

        editor.update.columnGroup.setColumns({
          at: [0],
          widths: ['40%', '40%'],
        });

        expect(
          getColumnGroup(editor).children.map((column) => column.width)
        ).toEqual(['50%', '50%']);
      });
    });

    describe('toggle', () => {
      it('wraps the selected block in a column group', () => {
        const editor = createEditor({
          selection: {
            kind: 'text',
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
          },
          value: [
            { children: [{ text: 'Some paragraph text' }], type: 'paragraph' },
          ],
        });

        editor.update.columnGroup.toggle({ columns: 2 });

        expect(getColumnGroup(editor).children).toHaveLength(2);
        expect(editor.read.text.string([0, 0])).toBe('Some paragraph text');
        expect(editor.read.text.string([0, 1])).toBe('');
      });

      it('updates an existing column group', () => {
        const editor = createEditor({
          selection: {
            kind: 'text',
            anchor: { offset: 0, path: [0, 0, 0, 0] },
            focus: { offset: 0, path: [0, 0, 0, 0] },
          },
        });

        editor.update.columnGroup.toggle({ columns: 3 });

        expect(getColumnGroup(editor).children).toHaveLength(3);
        expect(
          getColumnGroup(editor).children.map((column) => column.width)
        ).toEqual([`${100 / 3}%`, `${100 / 3}%`, `${100 / 3}%`]);
        expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
        expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
        expect(editor.read.text.string([0, 2])).toBe('');
      });

      it('merges content when reducing a group', () => {
        const editor = createEditor({
          selection: {
            kind: 'text',
            anchor: { offset: 0, path: [0, 1, 0, 0] },
            focus: { offset: 0, path: [0, 1, 0, 0] },
          },
          value: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'C' }], type: 'paragraph' }],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'columnGroup',
            },
          ],
        });

        editor.update.columnGroup.toggle({ columns: 2 });

        expect(editor.read.text.string([0, 0])).toBe('A');
        expect(editor.read.text.string([0, 1])).toBe('BC');
      });

      it('does nothing without a selected block', () => {
        const value: ColumnValue = [
          { children: [{ text: 'Some paragraph text' }], type: 'paragraph' },
        ];
        const editor = createEditor({ value });

        editor.update.columnGroup.toggle({ columns: 2 });

        expect(editor.read.children()).toEqual(value);
      });
    });

    it('normalizes existing column widths to one hundred percent', () => {
      const editor = createEditor({
        value: [
          {
            children: [
              {
                children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                type: 'column',
                width: '20%',
              },
              {
                children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                type: 'column',
                width: '20%',
              },
            ],
            type: 'columnGroup',
          },
        ],
      });

      editor.update.value.repair();

      expect(
        getColumnGroup(editor).children.map((column) => column.width)
      ).toEqual(['50%', '50%']);
    });
  });
}

describe('column transfer landing', () => {
  const paragraph = (text: string) => ({
    children: [{ text }],
    type: 'paragraph',
  });
  const columns = (...texts: string[]) => ({
    children: texts.map((text) => ({
      children: [paragraph(text)],
      type: 'column',
      width: `${100 / texts.length}%`,
    })),
    type: 'columnGroup',
  });
  const createColumns = (
    ...children: Array<ReturnType<typeof columns | typeof paragraph>>
  ) =>
    createRuntimeEditor({
      initialValue: children,
      plugins: columnPlugins,
    });
  const columnTexts = (editor: ReturnType<typeof createColumns>, at: number) =>
    editor.read.children()[at].children.map((column) => NodeApi.string(column));

  it('reorders column items inside their group', () => {
    const editor = createColumns(columns('a', 'b'));

    editor.api.transfer.move({
      nodes: [editor.key([0, 0])!],
      to: { edge: 'after', key: editor.key([0, 1])! },
    });

    expect(columnTexts(editor, 0)).toEqual(['b', 'a']);
  });

  it('refuses a column item from another editor at the same path', () => {
    const source = createColumns(columns('a', 'b'));
    const target = createColumns(columns('c', 'd'));

    expect(
      target.api.transfer.move({
        from: source,
        nodes: [source.key([0, 0])!],
        to: { edge: 'after', key: target.key([0, 1])! },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
    expect(columnTexts(target, 0)).toEqual(['c', 'd']);
  });

  it('refuses a block beside a column item', () => {
    const editor = createColumns(paragraph('x'), columns('a', 'b'));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0])!],
        to: { edge: 'after', key: editor.key([1, 0])! },
      }).status
    ).toBe('refused');
    expect(columnTexts(editor, 1)).toEqual(['a', 'b']);
  });

  it('lands a block beside a block inside a column item', () => {
    const editor = createColumns(paragraph('x'), columns('a', 'b'));

    editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1, 1, 0])! },
    });

    expect(
      editor.read
        .children()[0]
        .children.map((column) =>
          (column as Element).children.map((node) => NodeApi.string(node))
        )
    ).toEqual([['a'], ['b', 'x']]);
  });

  it('keeps the list family rule inside a column item', () => {
    const item = (text: string, indent: number) => ({
      children: [{ text }],
      indent,
      listType: ListType.Bulleted,
      type: 'paragraph',
    });
    const editor = createRuntimeEditor({
      initialValue: [
        item('moved', 1),
        {
          children: [
            {
              children: [item('parent', 1), item('child', 2)],
              type: 'column',
              width: '50%',
            },
            { children: [paragraph('b')], type: 'column', width: '50%' },
          ],
          type: 'columnGroup',
        },
      ] as never,
      plugins: [BaseIndentPlugin, ...columnPlugins, BaseListPlugin],
    });

    editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'before', key: editor.key([1, 0, 1])! },
    });

    expect(
      (editor.read.children()[0].children[0] as Element).children.map((node) =>
        NodeApi.string(node)
      )
    ).toEqual(['parent', 'child', 'moved']);
  });
});

describe('column side drop', () => {
  const paragraph = (text: string) => ({
    children: [{ text }],
    type: 'paragraph',
  });
  const columns = (...texts: string[]) => ({
    children: texts.map((text) => ({
      children: [paragraph(text)],
      type: 'column',
      width: `${100 / texts.length}%`,
    })),
    type: 'columnGroup',
  });
  const createColumns = (
    ...children: Array<ReturnType<typeof columns | typeof paragraph>>
  ) =>
    createRuntimeEditor({
      initialValue: children,
      plugins: columnPlugins,
    });
  const layout = (editor: ReturnType<typeof createColumns>) =>
    editor.read
      .children()
      .map((node) =>
        node.type === 'columnGroup'
          ? node.children.map((column) =>
              (column as Element).children.map((child) => NodeApi.string(child))
            )
          : NodeApi.string(node)
      );
  const widths = (editor: ReturnType<typeof createColumns>, at: number) => {
    const group = editor.read.children()[at];

    return group.children.map((column) =>
      Number.parseFloat((column as ColumnElement).width)
    );
  };

  it('puts a block dropped beside a root block in a new two-column group', () => {
    const editor = createColumns(paragraph('target'), paragraph('dragged'));

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0])!, side: 'end' },
    });

    expect(layout(editor)).toEqual([[['target'], ['dragged']]]);
  });

  it('adds a column beside the column of the target block', () => {
    const editor = createColumns(columns('a', 'b'), paragraph('dragged'));

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0, 0, 0])!, side: 'end' },
    });

    expect(layout(editor)).toEqual([[['a'], ['dragged'], ['b']]]);
  });

  it('keeps every column visible and in proportion as joins fill a group', () => {
    const editor = createColumns(
      {
        children: [
          { children: [paragraph('wide')], type: 'column', width: '70%' },
          { children: [paragraph('narrow')], type: 'column', width: '30%' },
        ],
        type: 'columnGroup',
      },
      paragraph('c'),
      paragraph('d'),
      paragraph('e')
    );

    const outcomes = ['c', 'd', 'e'].map(
      () =>
        editor.api.transfer.move({
          nodes: [editor.key([1])!],
          to: { key: editor.key([0, 1, 0])!, side: 'end' },
        }).status
    );
    const all = widths(editor, 0);
    const [wide, narrow] = all;

    expect([
      outcomes,
      all.length,
      all.every((width) => width > 0),
      Math.round(all.reduce((sum, width) => sum + width, 0)),
    ]).toEqual([['moved', 'moved', 'moved'], 5, true, 100]);
    expect(wide / narrow).toBeCloseTo(70 / 30);
  });

  it('adds a column before the column of the target block from its start side', () => {
    const editor = createColumns(columns('a', 'b'), paragraph('dragged'));

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0, 1, 0])!, side: 'start' },
    });

    expect(layout(editor)).toEqual([[['a'], ['dragged'], ['b']]]);
  });

  it('refuses a join into a group whose widths do not parse', () => {
    const editor = createColumns(
      {
        children: [
          { children: [paragraph('a')], type: 'column', width: 'auto' },
          { children: [paragraph('b')], type: 'column', width: 'auto' },
        ],
        type: 'columnGroup',
      },
      paragraph('dragged')
    );

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0, 0, 0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('refuses a column beyond the drop limit', () => {
    const editor = createColumns(
      columns('1', '2', '3', '4', '5'),
      paragraph('dragged')
    );

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0, 4, 0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('still loads a stored group wider than the drop limit', () => {
    const editor = createColumns(columns('1', '2', '3', '4', '5', '6', '7'));

    expect(editor.read.children()[0].children).toHaveLength(7);
  });

  it('refuses a column group dropped at a side', () => {
    const editor = createColumns(paragraph('target'), columns('a', 'b'));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('never wraps a column group in another group', () => {
    const editor = createColumns(columns('a', 'b'), paragraph('dragged'));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it("refuses a column's whole content dropped on the neighbor's facing side", () => {
    const editor = createColumns(columns('a', 'b'));

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 0, 0])!],
        to: { key: editor.key([0, 1, 0])!, side: 'start' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('adds a column beside a list item with deeper items inside a column', () => {
    const item = (text: string, indent: number) => ({
      children: [{ text }],
      indent,
      listType: ListType.Bulleted,
      type: 'paragraph',
    });
    const editor = createRuntimeEditor({
      initialValue: [
        {
          children: [
            {
              children: [item('parent', 1), item('child', 2)],
              type: 'column',
              width: '50%',
            },
            { children: [paragraph('b')], type: 'column', width: '50%' },
          ],
          type: 'columnGroup',
        },
        paragraph('x'),
      ] as never,
      plugins: [BaseIndentPlugin, ...columnPlugins, BaseListPlugin],
    });

    editor.api.transfer.move({
      nodes: [editor.key([1])!],
      to: { key: editor.key([0, 0, 0])!, side: 'end' },
    });

    expect(layout(editor)).toEqual([[['parent', 'child'], ['x'], ['b']]]);
  });

  it('refuses a list item with deeper items as the target', () => {
    const item = (text: string, indent: number) => ({
      children: [{ text }],
      indent,
      listType: ListType.Bulleted,
      type: 'paragraph',
    });
    const editor = createRuntimeEditor({
      initialValue: [
        item('parent', 1),
        item('child', 2),
        paragraph('x'),
      ] as never,
      plugins: [BaseIndentPlugin, ...columnPlugins, BaseListPlugin],
    });

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([2])!],
        to: { key: editor.key([0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });
});
