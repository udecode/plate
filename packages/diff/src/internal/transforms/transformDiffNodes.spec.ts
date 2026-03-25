import { transformDiffNodes } from './transformDiffNodes';

const options = {
  getDeleteProps: () => ({
    diff: true,
    diffOperation: { type: 'delete' },
  }),
  getInsertProps: () => ({
    diff: true,
    diffOperation: { type: 'insert' },
  }),
  getUpdateProps: (_node: any, properties: any, newProperties: any) => ({
    diff: true,
    diffOperation: {
      newProperties,
      properties,
      type: 'update',
    },
  }),
  isInline: () => false,
} as any;

describe('transformDiffNodes', () => {
  it('recursively diffs children when only children changed', () => {
    expect(
      transformDiffNodes(
        { type: 'p', children: [{ text: 'old' }] } as any,
        { type: 'p', children: [{ text: 'new' }] } as any,
        options
      )
    ).toEqual([
      {
        type: 'p',
        children: [
          {
            text: 'old',
            diff: true,
            diffOperation: { type: 'delete' },
          },
          {
            text: 'new',
            diff: true,
            diffOperation: { type: 'insert' },
          },
        ],
      },
    ]);
  });

  it('adds update props when only element props changed', () => {
    expect(
      transformDiffNodes(
        { type: 'p', align: 'left', children: [{ text: 'same' }] } as any,
        { type: 'p', align: 'right', children: [{ text: 'same' }] } as any,
        options
      )
    ).toEqual([
      {
        type: 'p',
        align: 'right',
        children: [{ text: 'same' }],
        diff: true,
        diffOperation: {
          type: 'update',
          properties: { align: 'left' },
          newProperties: { align: 'right' },
        },
      },
    ]);
  });

  it('returns false when neither children-only nor props-only strategies apply', () => {
    expect(
      transformDiffNodes(
        { text: 'old', bold: true } as any,
        { text: 'new', italic: true } as any,
        options
      )
    ).toBe(false);
  });
});
