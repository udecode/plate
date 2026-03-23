import { focusBlockStartById } from './focusBlockStartById';

describe('focusBlockStartById', () => {
  it('does nothing when the block cannot be found', () => {
    const select = mock();
    const focus = mock();
    const editor = {
      api: {
        node: mock(() => {}),
        start: mock(),
      },
      tf: {
        focus,
        select,
      },
    } as any;

    focusBlockStartById(editor, 'missing');

    expect(select).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
  });

  it('selects the block start and focuses the editor', () => {
    const select = mock();
    const focus = mock();
    const editor = {
      api: {
        node: mock(() => [{ id: 'a' }, [1]]),
        start: mock(() => ({ offset: 0, path: [1, 0] })),
      },
      tf: {
        focus,
        select,
      },
    } as any;

    focusBlockStartById(editor, 'a');

    expect(select).toHaveBeenCalledWith({ offset: 0, path: [1, 0] });
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
