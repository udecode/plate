import { selectBlockById } from './selectBlockById';

describe('selectBlockById', () => {
  it('does nothing when the block cannot be found', () => {
    const select = mock();
    const focus = mock();
    const editor = {
      api: {
        node: mock(() => {}),
        range: mock(),
      },
      tf: {
        focus,
        select,
      },
    } as any;

    selectBlockById(editor, 'missing');

    expect(select).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block range and focuses the editor', () => {
    const select = mock();
    const focus = mock();
    const editor = {
      api: {
        node: mock(() => [{ id: 'a' }, [1]]),
        range: mock(() => ({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 1] },
        })),
      },
      tf: {
        focus,
        select,
      },
    } as any;

    selectBlockById(editor, 'a');

    expect(select).toHaveBeenCalledWith({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 1] },
    });
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
