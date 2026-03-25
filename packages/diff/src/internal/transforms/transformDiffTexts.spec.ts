import { transformDiffTexts } from './transformDiffTexts';

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
        diffOperation: { type: 'delete' },
      },
      {
        text: 'b',
        diff: true,
        diffOperation: { type: 'delete' },
      },
      {
        ...mention,
        diff: true,
        diffOperation: { type: 'insert' },
      },
      {
        text: 'c',
        diff: true,
        diffOperation: { type: 'insert' },
      },
    ]);
  });
});
