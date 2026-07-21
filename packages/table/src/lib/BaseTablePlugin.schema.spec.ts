import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTablePlugin } from './BaseTablePlugin';

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
      value: [{ children: [row], type: KEYS.table }],
    });
    const rowSpec = editor.read.schema.element(KEYS.tr);
    const tableSpec = editor.read.schema.element(KEYS.table);
    const cellSpec = editor.read.schema.element(KEYS.td);

    expect(rowSpec).toMatchObject({
      content: {
        allowedElementTypes: [KEYS.td, KEYS.th],
        allowsText: false,
        default: { type: KEYS.td },
        min: 0,
      },
      groups: expect.not.arrayContaining(['block']),
      type: KEYS.tr,
    });
    expect(tableSpec?.groups).toContain('block');
    expect(cellSpec?.groups).not.toContain('block');
    expect(tableSpec?.content).toMatchObject({
      allowedElementTypes: [KEYS.tr],
      allowsText: false,
      default: { type: KEYS.tr },
      min: 1,
    });
    expect(cellSpec?.content).toMatchObject({
      allowedElementTypes: [KEYS.p],
      allowsText: false,
      default: { type: KEYS.p },
      min: 1,
    });
    expect(editor.read.schema.createAndFill(KEYS.table)).toEqual({
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
      editor.read.schema.validateFragment([
        { children: [paragraph('invalid')], type: KEYS.tr },
      ])
    ).toThrow(/cannot contain/i);
    expect(() =>
      editor.read.schema.validateFragment([
        { children: [paragraph('invalid')], type: KEYS.table },
      ])
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
    ).toThrow(/cannot contain/i);
  });
});
