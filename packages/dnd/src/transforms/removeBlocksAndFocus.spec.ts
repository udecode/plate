import * as queryModule from '../queries/getBlocksWithId';
import { removeBlocksAndFocus } from './removeBlocksAndFocus';

describe('removeBlocksAndFocus', () => {
  it('removes the block range and focuses the editor', () => {
    const getBlocksSpy = spyOn(queryModule, 'getBlocksWithId').mockReturnValue([
      [{ id: 'a', type: 'p' }, [0]],
      [{ id: 'b', type: 'p' }, [1]],
    ] as any);
    const removeNodes = mock();
    const focus = mock();
    const editor = {
      api: {
        nodesRange: mock(() => ({ anchor: [0], focus: [1] })),
      },
      tf: {
        focus,
        removeNodes,
      },
    } as any;

    removeBlocksAndFocus(editor, {} as any);

    expect(removeNodes).toHaveBeenCalledWith({
      at: { anchor: [0], focus: [1] },
    });
    expect(focus).toHaveBeenCalledTimes(1);

    getBlocksSpy.mockRestore();
  });
});
