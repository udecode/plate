import * as queryModule from '../queries/getBlocksWithId';
import { removeBlocksAndFocus } from './removeBlocksAndFocus';

describe('removeBlocksAndFocus', () => {
  it('removes the block range and focuses the editor', () => {
    const getBlocksSpy = spyOn(queryModule, 'getBlocksWithId').mockReturnValue([
      [{ id: 'a', type: 'p' }, [0]],
      [{ id: 'b', type: 'p' }, [1]],
    ] as any);
    const focus = mock();
    const removeNodes = mock();
    const tx = { nodes: { remove: removeNodes } };
    const editor = {
      api: {
        dom: { focus },
        nodesRange: mock(() => ({ anchor: [0], focus: [1] })),
      },
      update: mock((fn) => fn(tx)),
    } as any;

    removeBlocksAndFocus(editor, {} as any);

    expect(tx.nodes.remove).toHaveBeenCalledWith({
      at: { anchor: [0], focus: [1] },
    });
    expect(focus).toHaveBeenCalledTimes(1);

    getBlocksSpy.mockRestore();
  });
});
