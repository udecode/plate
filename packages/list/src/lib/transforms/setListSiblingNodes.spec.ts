import { KEYS } from 'platejs';

import * as getListSiblingsModule from '../queries/getListSiblings';
import * as setListNodeModule from './setListNode';
import { setListSiblingNodes } from './setListSiblingNodes';

describe('setListSiblingNodes', () => {
  afterEach(() => {
    mock.restore();
  });

  it('retypes sibling list items and clears todo metadata', () => {
    const getListSiblingsSpy = spyOn(
      getListSiblingsModule,
      'getListSiblings'
    ).mockReturnValue([
      [{ [KEYS.indent]: 2 }, [0]],
      [{ [KEYS.indent]: 3 }, [1]],
    ] as any);
    const setListNodeSpy = spyOn(
      setListNodeModule,
      'setListNode'
    ).mockImplementation(() => {});
    const setIndentTodoNodeSpy = spyOn(
      setListNodeModule,
      'setIndentTodoNode'
    ).mockImplementation(() => {});
    const unsetNodes = mock();
    const editor = {
      tf: {
        unsetNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    setListSiblingNodes(editor, [{ type: KEYS.p }, [0]] as any, {
      getSiblingListOptions: { breakOnEqIndentNeqListStyleType: false } as any,
      listStyleType: 'decimal',
    });

    expect(getListSiblingsSpy).toHaveBeenCalled();
    expect(unsetNodes).toHaveBeenNthCalledWith(1, KEYS.listChecked, {
      at: [0],
    });
    expect(unsetNodes).toHaveBeenNthCalledWith(2, KEYS.listChecked, {
      at: [1],
    });
    expect(setListNodeSpy).toHaveBeenNthCalledWith(1, editor, {
      at: [0],
      indent: 2,
      listStyleType: 'decimal',
    });
    expect(setListNodeSpy).toHaveBeenNthCalledWith(2, editor, {
      at: [1],
      indent: 3,
      listStyleType: 'decimal',
    });
    expect(setIndentTodoNodeSpy).not.toHaveBeenCalled();
  });

  it('uses todo helpers when retyping sibling todo items', () => {
    spyOn(getListSiblingsModule, 'getListSiblings').mockReturnValue([
      [{ [KEYS.indent]: 4 }, [3]],
    ] as any);
    const setListNodeSpy = spyOn(
      setListNodeModule,
      'setListNode'
    ).mockImplementation(() => {});
    const setIndentTodoNodeSpy = spyOn(
      setListNodeModule,
      'setIndentTodoNode'
    ).mockImplementation(() => {});
    const unsetNodes = mock();
    const editor = {
      tf: {
        unsetNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    setListSiblingNodes(editor, [{ type: KEYS.p }, [3]] as any, {
      listStyleType: KEYS.listTodo,
    });

    expect(unsetNodes).toHaveBeenCalledWith(KEYS.listType, { at: [3] });
    expect(setIndentTodoNodeSpy).toHaveBeenCalledWith(editor, {
      at: [3],
      indent: 4,
      listStyleType: KEYS.listTodo,
    });
    expect(setListNodeSpy).not.toHaveBeenCalled();
  });
});
