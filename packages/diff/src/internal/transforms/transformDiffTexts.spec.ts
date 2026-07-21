import { transformDiffTexts } from './transformDiffTexts';

const options = {
  getDeleteProps: () => ({
    diff: true,
    diffIntent: { type: 'delete' },
  }),
  getInsertProps: () => ({
    diff: true,
    diffIntent: { type: 'insert' },
  }),
  getUpdateProps: (_node: any, properties: any, newProperties: any) => ({
    diff: true,
    diffIntent: {
      newProperties,
      properties,
      type: 'update',
    },
  }),
  isInline: (node: any) => !!node && node.type === 'mention',
} as any;

describe('transformDiffTexts', () => {
  it('throws when either side is empty', () => {
    expect(() =>
      transformDiffTexts([], [{ text: 'next' }] as any, options)
    ).toThrow('must have at least one nodes');
    expect(() =>
      transformDiffTexts([{ text: 'prev' }] as any, [], options)
    ).toThrow('must have at least one nextNodes');
  });

  it('recursively diffs the children of related inline elements', () => {
    expect(
      transformDiffTexts(
        [{ type: 'mention', id: '1', children: [{ text: 'old' }] }] as any,
        [{ type: 'mention', id: '1', children: [{ text: 'new' }] }] as any,
        options
      )
    ).toEqual([
      {
        type: 'mention',
        id: '1',
        children: [
          {
            text: 'old',
            diff: true,
            diffIntent: { type: 'delete' },
          },
          {
            text: 'new',
            diff: true,
            diffIntent: { type: 'insert' },
          },
        ],
      },
    ]);
  });

  it('restores inline nodes after diffing mixed text and inline arrays', () => {
    const mention = { type: 'mention', id: '1', children: [{ text: '' }] };

    expect(
      transformDiffTexts(
        [{ text: 'a' }, mention, { text: 'b' }] as any,
        [{ text: 'a' }, mention, { text: 'c' }] as any,
        options
      )
    ).toEqual([
      { text: 'a' },
      {
        ...mention,
        diff: true,
        diffIntent: { type: 'delete' },
      },
      {
        text: 'b',
        diff: true,
        diffIntent: { type: 'delete' },
      },
      {
        ...mention,
        diff: true,
        diffIntent: { type: 'insert' },
      },
      {
        text: 'c',
        diff: true,
        diffIntent: { type: 'insert' },
      },
    ]);
  });

  it('encodes removed properties without undefined JSON values', () => {
    const result = transformDiffTexts(
      [{ bold: true, text: 'same' }] as any,
      [{ text: 'same' }] as any,
      options
    );

    expect(result).toEqual([
      {
        diff: true,
        diffIntent: {
          newProperties: {},
          properties: { bold: true },
          type: 'update',
        },
        text: 'same',
      },
    ]);
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });

  it('preserves the target empty leaf', () => {
    expect(
      transformDiffTexts([{ text: '' }] as any, [{ text: '' }] as any, options)
    ).toEqual([{ text: '' }]);
  });
});
