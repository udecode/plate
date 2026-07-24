import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';

const paragraph = (text = '') => ({
  children: [{ text }],
  type: KEYS.p,
});

const cell = (type: typeof KEYS.td | typeof KEYS.th) => ({
  children: [paragraph()],
  type,
});

describe('BaseTablePlugin schema', () => {
  it('merges Plate node behavior with the explicit row grammar', () => {
    const row = {
      children: [cell(KEYS.td), cell(KEYS.th)],
      type: KEYS.tr,
    };
    const editor = createBaseEditor({
      plugins: [BaseTablePlugin],
      initialValue: [{ children: [row], type: KEYS.table }],
    });
    const rowSpec = editor.read.schema.element(BaseTableRowPlugin);
    const tableSpec = editor.read.schema.element(BaseTablePlugin);
    const cellSpec = editor.read.schema.element(BaseTableCellPlugin);

    expect(rowSpec).toMatchObject({
      content: {
        allowedElementTypes: [KEYS.td, KEYS.th],
        allowsText: false,
        default: { type: KEYS.td },
        min: 0,
      },
      groups: expect.arrayContaining(['block']),
      type: KEYS.tr,
    });
    expect(tableSpec?.groups).toContain('block');
    expect(cellSpec?.groups).toContain('block');
    expect(tableSpec?.content).toMatchObject({
      allowedElementTypes: [KEYS.tr],
      allowsText: false,
      default: { type: KEYS.tr },
      min: 1,
    });
    expect(cellSpec?.content).toMatchObject({
      allowedElementTypes: [KEYS.p, KEYS.table],
      allowsText: false,
      default: { type: KEYS.p },
      min: 1,
    });
    expect(editor.read.schema.createAndFill(BaseTablePlugin)).toEqual({
      children: [
        {
          children: [],
          type: KEYS.tr,
        },
      ],
      type: KEYS.table,
    });
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [
              {
                children: [{ ...cell(KEYS.td), rowSpan: 2 }],
                type: KEYS.tr,
              },
              { children: [], type: KEYS.tr },
            ],
            type: KEYS.table,
          },
        ],
      })
    ).not.toThrow();
    expect(() =>
      editor.read.schema.validateDocument({ children: [row] })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateDocument({ children: [cell(KEYS.td)] })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [{ children: [paragraph('invalid')], type: KEYS.tr }],
            type: KEYS.table,
          },
        ],
      })
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [paragraph('invalid')],
            type: KEYS.table,
          },
        ],
      })
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.validateFragment([
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
                              type: KEYS.td,
                            },
                          ],
                          type: KEYS.tr,
                        },
                      ],
                      type: KEYS.table,
                    },
                  ],
                  type: KEYS.td,
                },
              ],
              type: KEYS.tr,
            },
          ],
          type: KEYS.table,
        },
      ])
    ).not.toThrow();
  });

  it('validates table-owned JSON properties', () => {
    const editor = createBaseEditor({
      plugins: [BaseTablePlugin],
      initialValue: [
        {
          children: [{ children: [cell(KEYS.td)], type: KEYS.tr }],
          type: KEYS.table,
        },
      ],
    });
    const colSpan = editor.read.schema.property({
      key: 'colSpan',
      placement: 'element',
      type: KEYS.td,
    })?.value.validate;
    const borders = editor.read.schema.property({
      key: 'borders',
      placement: 'element',
      type: KEYS.td,
    })?.value.validate;
    const colSizes = editor.read.schema.property({
      key: 'colSizes',
      placement: 'element',
      type: KEYS.table,
    })?.value.validate;

    expect(
      editor.read.schema.property({
        key: 'colSpan',
        placement: 'element',
        type: KEYS.td,
      })?.value.kind
    ).toBe('number');
    expect(colSpan).toBeUndefined();
    expect(() =>
      editor.read.schema.validateDocument({
        children: [
          {
            children: [
              {
                children: [{ ...cell(KEYS.td), colSpan: '2' }],
                type: KEYS.tr,
              },
            ],
            type: KEYS.table,
          },
        ],
      })
    ).toThrow(/colSpan.*number|number.*colSpan/i);
    expect(
      editor.read.schema.property({
        key: 'attributes',
        placement: 'element',
        type: KEYS.td,
      })
    ).toBeNull();
    expect(borders?.({ bottom: { color: 'red', size: 1 } })).toBe(true);
    expect(borders?.({ bottom: { size: Number.POSITIVE_INFINITY } })).toBe(
      false
    );
    expect(colSizes?.([40, 60])).toBe(true);
    expect(colSizes?.([40, Number.NaN])).toBe(false);
  });
});
