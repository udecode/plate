import { selectBlockById } from './selectBlockById';

describe('selectBlockById', () => {
  it('does nothing when the block cannot be found', () => {
    const focus = mock();
    const update = mock();
    const editor = {
      api: {
        dom: { focus },
        node: mock(() => {}),
        range: mock(),
      },
      update,
    } as any;

    selectBlockById(editor, 'missing');

    expect(update).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block range and focuses the editor', () => {
    const focus = mock();
    const setSelection = mock();
    const tx = { selection: { set: setSelection } };
    const editor = {
      api: {
        dom: { focus },
        node: mock(() => [{ id: 'a' }, [1]]),
        range: mock(() => ({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 1] },
        })),
      },
      update: mock((fn) => fn(tx)),
    } as any;

    selectBlockById(editor, 'a');

    expect(setSelection).toHaveBeenCalledWith({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 1] },
    });
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
