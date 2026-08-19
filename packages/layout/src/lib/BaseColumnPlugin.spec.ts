import {
  BaseParagraphPlugin,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { PLUGINS } from '@platejs/utils';
import {
  BaseColumnItemPlugin,
  BaseColumnPlugin,
  type ColumnElement,
  type ColumnGroupElement,
} from './BaseColumnPlugin';
import { ColumnItemPlugin, ColumnPlugin } from '../react/ColumnPlugin';
import assert from 'node:assert/strict';
import {
  type Element,
  ElementApi,
  schema,
  type Selection,
} from '@platejs/plite';

const columnPlugins = [BaseColumnPlugin] as const;
const TestColumnHostPlugin = defineBasePlugin('testColumnHost', {
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
  node.type === PLUGINS.columnGroup &&
  node.children.every(
    (child) =>
      ElementApi.isElement(child) &&
      child.type === PLUGINS.column &&
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
      createBaseEditor({
        plugins: [
          BaseColumnPlugin,
          BaseColumnItemPlugin.configure({ enabled: false }),
        ],
      })
    ).toThrow(/columnGroup.*disabled.*column|column.*disabled.*columnGroup/i);
  });

  it('keeps the column item independently installable', () => {
    expect(() =>
      createBaseEditor({
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
    const editor = createBaseEditor({
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
    createBaseEditor({
      plugins: columnPlugins,
      selection,
      initialValue: value,
    });

  const getColumnGroup = (editor: ReturnType<typeof createEditor>) => {
    const entry = editor.read.nodes.get([0], { match: isColumnGroupNode });

    assert(entry);

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
        expect(columnGroup.children[2].width).toBe('44.333333333333336%');
        expect(columnGroup.children[0].width).toBe('28.333333333333332%');
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

        assert(entry);
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

        assert(entry);
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

        assert(entry);
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
          kind: 'text',
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 0, 0, 0] },
        });
        expect(editor.update.column.selectAll()).toBe(true);
        expect(editor.read.selection()).toEqual({
          kind: 'text',
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
          kind: 'text',
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
