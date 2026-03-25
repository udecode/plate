import { diffNodes, isEqualNode, isEqualNodeChildren } from './diff-nodes';

const options = {
  getDeleteProps: () => ({}),
  getInsertProps: () => ({}),
  getUpdateProps: () => ({}),
  isInline: () => false,
} as any;

describe('diffNodes', () => {
  it('respects elementsAreRelated and emits leading inserts before the related node', () => {
    const result = diffNodes(
      [{ type: 'heading', children: [{ text: 'same' }] }] as any,
      [
        { type: 'paragraph', children: [{ text: 'same' }] },
        { type: 'heading', children: [{ text: 'same' }] },
      ] as any,
      {
        ...options,
        elementsAreRelated: (element, nextElement) =>
          element.type === nextElement.type,
      }
    );

    expect(result).toEqual([
      {
        insert: true,
        originNode: {
          type: 'paragraph',
          children: [{ text: 'same' }],
        },
      },
      {
        childrenUpdated: false,
        delete: false,
        nodeUpdated: false,
        originNode: {
          type: 'heading',
          children: [{ text: 'same' }],
        },
        relatedNode: {
          type: 'heading',
          children: [{ text: 'same' }],
        },
      },
    ]);
  });

  it('matches nodes when ignored props are the only prop differences', () => {
    const result = diffNodes(
      [{ type: 'p', id: 'a', children: [{ text: 'same' }] }] as any,
      [{ type: 'p', id: 'b', children: [{ text: 'same' }] }] as any,
      {
        ...options,
        ignoreProps: ['id'],
      }
    );

    expect(result[0]).toMatchObject({
      childrenUpdated: true,
      delete: false,
      nodeUpdated: true,
      relatedNode: {
        id: 'b',
        type: 'p',
      },
    });
  });
});

describe('isEqualNode', () => {
  it('compares element props while ignoring children and ignored props', () => {
    expect(
      isEqualNode(
        {
          type: 'p',
          id: 'a',
          align: 'left',
          children: [{ text: 'one' }],
        } as any,
        {
          type: 'p',
          id: 'b',
          align: 'left',
          children: [{ text: 'two' }],
        } as any,
        ['id']
      )
    ).toBe(true);
  });
});

describe('isEqualNodeChildren', () => {
  it('compares text-node content directly', () => {
    expect(
      isEqualNodeChildren({ text: 'same' } as any, { text: 'same' } as any)
    ).toBe(true);
    expect(
      isEqualNodeChildren({ text: 'same' } as any, { text: 'next' } as any)
    ).toBe(false);
  });
});
