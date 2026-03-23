import { getBlocksWithId } from './getBlocksWithId';

describe('getBlocksWithId', () => {
  it('collects only block nodes with ids from editor.api.nodes', () => {
    const nodes = [
      [{ children: [{ text: '' }], id: 'a', type: 'p' }, [0]],
      [{ children: [{ text: '' }], type: 'p' }, [1]],
      [{ children: [{ text: '' }], id: 'b', type: 'blockquote' }, [2]],
    ];
    const editor = {
      api: {
        isBlock: (node: any) => node.type !== 'text',
        nodes: ({ match }: any) =>
          nodes.filter(([node]) => match(node))[Symbol.iterator](),
      },
    } as any;

    expect(getBlocksWithId(editor, {} as any)).toEqual([
      [{ children: [{ text: '' }], id: 'a', type: 'p' }, [0]],
      [{ children: [{ text: '' }], id: 'b', type: 'blockquote' }, [2]],
    ]);
  });
});
