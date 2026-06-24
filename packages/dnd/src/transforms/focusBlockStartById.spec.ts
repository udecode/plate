import { focusBlockStartById } from './focusBlockStartById';

describe('focusBlockStartById', () => {
  it('does nothing when the block cannot be found', () => {
    const focus = mock();
    const update = mock();
    const editor = {
      api: {
        dom: { focus },
        node: mock(() => {}),
        start: mock(),
      },
      update,
    } as any;

    focusBlockStartById(editor, 'missing');

    expect(update).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block start and focuses the editor', () => {
    const focus = mock();
    const setSelection = mock();
    const tx = { selection: { set: setSelection } };
    const editor = {
      api: {
        dom: { focus },
        node: mock(() => [{ id: 'a' }, [1]]),
        start: mock(() => ({ offset: 0, path: [1, 0] })),
      },
      update: mock((fn) => fn(tx)),
    } as any;

    focusBlockStartById(editor, 'a');

    expect(setSelection).toHaveBeenCalledWith({ offset: 0, path: [1, 0] });
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
