import { createTestBaseTableEditor } from './__tests__/getTestTablePlugins';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';

const paragraph = (text = '') => ({
  children: [{ text }],
  type: 'paragraph',
});

const cell = (header = false) => ({
  children: [paragraph()],
  ...(header ? { header: true } : {}),
  type: 'tableCell',
});

describe('BaseTablePlugin schema', () => {
  it('merges Plate node behavior with the explicit row grammar', () => {
    const row = {
      children: [cell(), cell(true)],
      type: 'tableRow',
    };
    const editor = createTestBaseTableEditor({
      plugins: [BaseTablePlugin],
      initialValue: [{ children: [row], type: 'table' }],
    });
    const rowSpec = editor.read.schema.element(BaseTableRowPlugin);
    const tableSpec = editor.read.schema.element(BaseTablePlugin);
    const cellSpec = editor.read.schema.element(BaseTableCellPlugin);

    expect(rowSpec).toMatchObject({
      content: {
        allowedElementTypes: ['tableCell'],
        allowsText: false,
        default: { type: 'tableCell' },
        min: 0,
      },
      groups: expect.arrayContaining(['block']),
      type: 'tableRow',
    });
    expect(tableSpec?.groups).toContain('block');
    expect(cellSpec?.groups).toContain('block');
    expect(tableSpec?.content).toMatchObject({
      allowedElementTypes: ['tableRow'],
      allowsText: false,
      default: { type: 'tableRow' },
      min: 1,
    });
    expect(cellSpec?.content).toMatchObject({
      allowedElementTypes: ['paragraph', 'table'],
      allowsText: false,
      default: { type: 'paragraph' },
      min: 1,
    });
    expect(editor.read.schema.create(BaseTablePlugin)).toEqual({
      children: [
        {
          children: [],
          type: 'tableRow',
        },
      ],
      type: 'table',
    });
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [
              {
                children: [{ ...cell(), rowSpan: 2 }],
                type: 'tableRow',
              },
              { children: [], type: 'tableRow' },
            ],
            type: 'table',
          },
        ],
      })
    ).not.toThrow();
    expect(() =>
      editor.read.schema.assertDocument({ children: [row] })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.assertDocument({ children: [cell()] })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [paragraph('invalid')], type: 'tableRow' }],
            type: 'table',
          },
        ],
      })
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [paragraph('invalid')],
            type: 'table',
          },
        ],
      })
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.assertFragment([
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              children: [paragraph('nested')],
                              type: 'tableCell',
                            },
                          ],
                          type: 'tableRow',
                        },
                      ],
                      type: 'table',
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
      ])
    ).not.toThrow();
  });

  it('validates table-owned JSON properties', () => {
    const editor = createTestBaseTableEditor({
      plugins: [BaseTablePlugin],
      initialValue: [
        {
          children: [{ children: [cell()], type: 'tableRow' }],
          type: 'table',
        },
      ],
    });
    const colSpan = editor.read.schema.property({
      key: 'colSpan',
      placement: 'element',
      type: 'tableCell',
    })?.value.validate;
    const borders = editor.read.schema.property({
      key: 'borders',
      placement: 'element',
      type: 'tableCell',
    })?.value.validate;
    const columnWidths = editor.read.schema.property({
      key: 'columnWidths',
      placement: 'element',
      type: 'table',
    })?.value.validate;

    expect(
      editor.read.schema.property({
        key: 'colSpan',
        placement: 'element',
        type: 'tableCell',
      })?.value.kind
    ).toBe('number');
    expect(colSpan?.(2)).toBe(true);
    expect(colSpan?.(1.5)).toBe(false);
    expect(colSpan?.(0)).toBe(false);
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [
              {
                children: [{ ...cell(), colSpan: '2' }],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      })
    ).toThrow(/colSpan.*number|number.*colSpan/i);
    expect(
      editor.read.schema.property({
        key: 'attributes',
        placement: 'element',
        type: 'tableCell',
      })
    ).toBeNull();
    expect(borders?.({ bottom: { color: 'red', width: 1 } })).toBe(true);
    expect(borders?.({ bottom: { size: 2 } })).toBe(false);
    expect(borders?.({ bottom: { width: Number.POSITIVE_INFINITY } })).toBe(
      false
    );
    expect(columnWidths?.([40, 60])).toBe(true);
    expect(columnWidths?.([40, null])).toBe(true);
    expect(columnWidths?.([40, 0])).toBe(false);
    expect(columnWidths?.([40, Number.NaN])).toBe(false);
  });
});
