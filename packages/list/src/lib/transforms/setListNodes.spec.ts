import { KEYS } from 'platejs';

import { setListNodes } from './setListNodes';

describe('setListNodes', () => {
  it('increments indent for non-list blocks before applying list metadata', () => {
    const set = mock();
    const unset = mock();
    const editor = {
      update: (fn: any) => fn({ nodes: { set, unset } }),
    } as any;

    setListNodes(editor, [[{ [KEYS.indent]: 1, type: KEYS.p }, [0]]] as any, {
      listStyleType: 'decimal',
    });

    expect(unset).toHaveBeenCalledWith(KEYS.listChecked, { at: [0] });
    expect(set).toHaveBeenCalledWith(
      { indent: 2, listStyleType: 'decimal' },
      { at: [0] }
    );
  });

  it('sets todo metadata without opening a nested update', () => {
    const set = mock();
    const unset = mock();
    const editor = {
      update: (fn: any) => fn({ nodes: { set, unset } }),
    } as any;

    setListNodes(
      editor,
      [
        [{ [KEYS.indent]: 3, [KEYS.listChecked]: true, type: KEYS.p }, [2]],
      ] as any,
      { listStyleType: 'todo' }
    );

    expect(unset).toHaveBeenCalledWith(KEYS.listType, { at: [2] });
    expect(set).toHaveBeenCalledWith(
      { checked: false, indent: 3, listStyleType: 'todo' },
      { at: [2] }
    );
  });
});
