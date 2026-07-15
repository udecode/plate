import { KEYS } from 'platejs';

import * as getListSiblingsModule from '../queries/getListSiblings';
import { setListSiblingNodes } from './setListSiblingNodes';

describe('setListSiblingNodes', () => {
  afterEach(() => {
    mock.restore();
  });

  it('retypes sibling list items and clears todo metadata', () => {
    spyOn(getListSiblingsModule, 'getListSiblings').mockReturnValue([
      [{ [KEYS.indent]: 2 }, [0]],
      [{ [KEYS.indent]: 3 }, [1]],
    ] as any);
    const set = mock();
    const unset = mock();
    const editor = {
      update: (fn: any) => fn({ nodes: { set, unset } }),
    } as any;

    setListSiblingNodes(editor, [{ type: KEYS.p }, [0]] as any, {
      getSiblingListOptions: { breakOnEqIndentNeqListStyleType: false } as any,
      listStyleType: 'decimal',
    });

    expect(unset).toHaveBeenNthCalledWith(1, KEYS.listChecked, { at: [0] });
    expect(unset).toHaveBeenNthCalledWith(2, KEYS.listChecked, { at: [1] });
    expect(set).toHaveBeenNthCalledWith(
      1,
      { indent: 2, listStyleType: 'decimal' },
      { at: [0] }
    );
    expect(set).toHaveBeenNthCalledWith(
      2,
      { indent: 3, listStyleType: 'decimal' },
      { at: [1] }
    );
  });

  it('sets todo metadata on sibling items', () => {
    spyOn(getListSiblingsModule, 'getListSiblings').mockReturnValue([
      [{ [KEYS.indent]: 4 }, [3]],
    ] as any);
    const set = mock();
    const unset = mock();
    const editor = {
      update: (fn: any) => fn({ nodes: { set, unset } }),
    } as any;

    setListSiblingNodes(editor, [{ type: KEYS.p }, [3]] as any, {
      listStyleType: KEYS.listTodo,
    });

    expect(unset).toHaveBeenCalledWith(KEYS.listType, { at: [3] });
    expect(set).toHaveBeenCalledWith(
      { checked: false, indent: 4, listStyleType: KEYS.listTodo },
      { at: [3] }
    );
  });
});
