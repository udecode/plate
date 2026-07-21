import { transformDiffDescendants } from './transformDiffDescendants';

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
  isInline: () => false,
} as any;

describe('transformDiffDescendants', () => {
  it('passes through the next nodes when delete/insert differs only by ignored props', () => {
    const stringCharMapping = {
      stringToNodes: (value: string) =>
        value === 'a'
          ? [{ type: 'p', id: 'old', children: [{ text: 'same' }] }]
          : [{ type: 'p', id: 'new', children: [{ text: 'same' }] }],
    };

    expect(
      transformDiffDescendants(
        [
          [-1, 'a'],
          [1, 'b'],
        ] as any,
        {
          ...options,
          ignoreProps: ['id'],
          stringCharMapping,
        } as any
      )
    ).toEqual([
      {
        type: 'p',
        id: 'new',
        children: [{ text: 'same' }],
      },
    ]);
  });

  it('flushes buffered deletions before later insertions around unchanged nodes', () => {
    const stringCharMapping = {
      stringToNodes: (value: string) =>
        ({
          a: [{ type: 'p', children: [{ text: 'delete' }] }],
          b: [{ type: 'p', children: [{ text: 'insert' }] }],
          c: [{ type: 'p', children: [{ text: 'stay' }] }],
        })[value],
    };

    expect(
      transformDiffDescendants(
        [
          [-1, 'a'],
          [0, 'c'],
          [1, 'b'],
        ] as any,
        {
          ...options,
          stringCharMapping,
        } as any
      )
    ).toEqual([
      {
        type: 'p',
        children: [{ text: 'delete' }],
        diff: true,
        diffIntent: { type: 'delete' },
      },
      {
        type: 'p',
        children: [{ text: 'stay' }],
      },
      {
        type: 'p',
        children: [{ text: 'insert' }],
        diff: true,
        diffIntent: { type: 'insert' },
      },
    ]);
  });

  it('uses text transforms for text-only replace pairs', () => {
    const stringCharMapping = {
      stringToNodes: (value: string) =>
        ({
          a: [{ text: 'old' }],
          b: [{ text: 'new' }],
        })[value],
    };

    expect(
      transformDiffDescendants(
        [
          [-1, 'a'],
          [1, 'b'],
        ] as any,
        {
          ...options,
          stringCharMapping,
        } as any
      )
    ).toEqual([
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
    ]);
  });
});
