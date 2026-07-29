import { createBaseEditor } from '@platejs/core';
import { KEYS, NODES, type TColumnGroupElement } from '@platejs/utils';
import { BaseColumnItemPlugin, BaseColumnPlugin } from './BaseColumnPlugin';
import { ColumnItemPlugin, ColumnPlugin } from '../react/ColumnPlugin';
import assert from 'node:assert/strict';
import { type Selection, type Value } from '@platejs/plite';

describe('BaseColumnPlugin schema', () => {
  it('declares the item as an exact required Base and React dependency', () => {
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

  it('constructs configured column-group content from plugin-key grammar', () => {
    const editor = createBaseEditor({
      plugins: [BaseColumnPlugin],
    });

    expect(editor.read.schema.createAndFill(BaseColumnPlugin)).toEqual({
      children: [
        {
          children: [{ children: [{ text: '' }], type: KEYS.p }],
          type: KEYS.column,
        },
        {
          children: [{ children: [{ text: '' }], type: KEYS.p }],
          type: KEYS.column,
        },
      ],
      type: NODES.columnGroup,
    });
    expect(editor.read.schema.element(BaseColumnPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.element(BaseColumnItemPlugin)?.groups).toContain(
      'block'
    );
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: KEYS.p }],
            type: KEYS.column,
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [
            { children: [{ text: '' }], type: KEYS.p },
            { children: [{ text: '' }], type: KEYS.p },
          ],
          type: NODES.columnGroup,
        },
      ])
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [
            {
              children: [{ children: [{ text: '' }], type: KEYS.p }],
              type: KEYS.column,
            },
          ],
          type: NODES.columnGroup,
        },
      ])
    ).toThrow(/at least 2 children/i);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: '' }], type: KEYS.p }],
                type: KEYS.column,
              },
              {
                children: [{ children: [{ text: '' }], type: KEYS.p }],
                type: KEYS.column,
              },
            ],
            layout: [50, '50'],
            type: NODES.columnGroup,
          },
        ],
      })
    ).toThrow(/element property "layout" fails custom property validation/);
  });
});

{
  const twoColumns: Value = [
    {
      children: [
        {
          children: [{ children: [{ text: 'Column 1 text' }], type: 'p' }],
          type: 'column',
          width: '50%',
        },
        {
          children: [{ children: [{ text: 'Column 2 text' }], type: 'p' }],
          type: 'column',
          width: '50%',
        },
      ],
      type: 'column_group',
    },
  ];

  const createEditor = ({
    selection,
    value = twoColumns,
  }: {
    selection?: Selection;
    value?: Value;
  } = {}) =>
    createBaseEditor({
      plugins: [BaseColumnPlugin],
      selection,
      initialValue: value,
    });

  const getColumnGroup = (editor: ReturnType<typeof createEditor>) => {
    const entry = editor.read.nodes.get<TColumnGroupElement>([0]);

    assert(entry);

    return entry[0];
  };

  describe('BaseColumnPlugin update', () => {
    describe('insert', () => {
      it('inserts a column with the default width and an empty block', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'First' }], type: 'p' }],
                  type: 'column',
                  width: '34%',
                },
                {
                  children: [{ children: [{ text: 'Second' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
              ],
              type: 'column_group',
            },
          ],
        });

        editor.update.column.insert({ at: [0, 2] });

        const columnGroup = getColumnGroup(editor);

        expect(columnGroup.children).toHaveLength(3);
        expect(columnGroup.children[2].type).toBe('column');
        expect(columnGroup.children[2].width).toBe('33%');
        expect(columnGroup.children[0].width).toBe('34%');
        expect(columnGroup.children[2].children[0]).toMatchObject({
          type: 'p',
        });
      });

      it('respects a custom width and insertion path', () => {
        const editor = createEditor({
          value: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'Existing' }], type: 'p' }],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [{ children: [{ text: 'Second' }], type: 'p' }],
                  type: 'column',
                  width: '25%',
                },
              ],
              type: 'column_group',
            },
          ],
        });

        editor.update.column.insert({ at: [0, 0], width: '25%' });

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
          value: [{ children: [{ text: 'Before' }], type: 'p' }],
        });

        editor
          .plugin(BaseColumnItemPlugin)
          .update.insertGroup({ at: [1], columns: 3 });

        const entry = editor.read.nodes.get<TColumnGroupElement>([1]);

        assert(entry);
        expect(BaseColumnPlugin.key).toBe('columnGroup');
        expect(BaseColumnPlugin.type).toBe(NODES.columnGroup);
        expect(entry[0].type).toBe(NODES.columnGroup);
        expect(entry[0].children).toHaveLength(3);
        expect(entry[0].children[0].width).toContain('33.3333');
        expect(entry[0].children[1].width).toContain('33.3333');
        expect(entry[0].children[2].width).toContain('33.3333');
        expect(entry[0].children[0].children[0]).toMatchObject({ type: 'p' });
      });

      it('selects the first inserted block when asked', () => {
        const editor = createEditor({
          value: [{ children: [{ text: 'Before' }], type: 'p' }],
        });

        editor.update.column.insertGroup({
          at: [1],
          columns: 2,
          select: true,
        });

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
                  children: [{ children: [{ text: 'Left' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'Middle' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'Right' }], type: 'p' }],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'column_group',
            },
          ],
        });
        const entry = editor.read.nodes.get<TColumnGroupElement>([0]);

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
                  children: [{ children: [{ text: 'Left' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: '' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'Right' }], type: 'p' }],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'column_group',
            },
          ],
        });
        const entry = editor.read.nodes.get<TColumnGroupElement>([0]);

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
                  children: [{ children: [{ text: 'abc' }], type: 'p' }],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [{ children: [{ text: 'def' }], type: 'p' }],
                  type: 'column',
                  width: '50%',
                },
              ],
              type: 'column_group',
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
                  children: [{ children: [{ text: 'abc' }], type: 'p' }],
                  type: 'column',
                  width: '50%',
                },
                {
                  children: [{ children: [{ text: 'def' }], type: 'p' }],
                  type: 'column',
                  width: '50%',
                },
              ],
              type: 'column_group',
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

        editor.update.column.set({ at: [0], widths: ['30%', '70%'] });

        expect(
          getColumnGroup(editor).children.map((column) => column.width)
        ).toEqual(['30%', '70%']);
        expect(editor.read.text.string([0, 0])).toBe('Column 1 text');
        expect(editor.read.text.string([0, 1])).toBe('Column 2 text');
      });

      it('adds empty columns while preserving content', () => {
        const editor = createEditor();

        editor.update.column.set({
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
                  children: [{ children: [{ text: 'A' }], type: 'p' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'p' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'C' }], type: 'p' }],
                  type: 'column',
                  width: '25%',
                },
                {
                  children: [{ children: [{ text: 'D' }], type: 'p' }],
                  type: 'column',
                  width: '25%',
                },
              ],
              type: 'column_group',
            },
          ],
        });

        editor.update.column.set({ at: [0], widths: ['50%', '50%'] });

        expect(getColumnGroup(editor).children).toHaveLength(2);
        expect(editor.read.text.string([0, 0])).toBe('A');
        expect(editor.read.text.string([0, 1])).toBe('BCD');
      });

      it('preserves content across repeated count changes', () => {
        const editor = createEditor();

        editor.update.column.set({
          at: [0],
          widths: ['33%', '33%', '34%'],
        });
        editor.update.nodes.insert(
          { children: [{ text: 'Column 3 text' }], type: 'p' },
          { at: [0, 2, 1] }
        );
        editor.update.column.set({ at: [0], widths: ['50%', '50%'] });
        editor.update.column.set({
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

        editor.update.column.set({ widths: ['100%'] });
        editor.update.column.set({ at: [999], widths: ['100%'] });
        editor.update.column.set({ at: [0], widths: [] });

        expect(editor.read.children()).toEqual(twoColumns);
      });

      it('normalizes widths through the group correction', () => {
        const editor = createEditor();

        editor.update.column.set({ at: [0], widths: ['40%', '40%'] });

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
          value: [{ children: [{ text: 'Some paragraph text' }], type: 'p' }],
        });

        editor.update.column.toggle({ columns: 2 });

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

        editor.update.column.toggle({ columns: 3 });

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
                  children: [{ children: [{ text: 'A' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'p' }],
                  type: 'column',
                  width: '33%',
                },
                {
                  children: [{ children: [{ text: 'C' }], type: 'p' }],
                  type: 'column',
                  width: '34%',
                },
              ],
              type: 'column_group',
            },
          ],
        });

        editor.update.column.toggle({ columns: 2 });

        expect(editor.read.text.string([0, 0])).toBe('A');
        expect(editor.read.text.string([0, 1])).toBe('BC');
      });

      it('does nothing without a selected block', () => {
        const value: Value = [
          { children: [{ text: 'Some paragraph text' }], type: 'p' },
        ];
        const editor = createEditor({ value });

        editor.update.column.toggle({ columns: 2 });

        expect(editor.read.children()).toEqual(value);
      });
    });

    it('normalizes existing column widths to one hundred percent', () => {
      const editor = createEditor({
        value: [
          {
            children: [
              {
                children: [{ children: [{ text: 'A' }], type: 'p' }],
                type: 'column',
                width: '20%',
              },
              {
                children: [{ children: [{ text: 'B' }], type: 'p' }],
                type: 'column',
                width: '20%',
              },
            ],
            type: 'column_group',
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
