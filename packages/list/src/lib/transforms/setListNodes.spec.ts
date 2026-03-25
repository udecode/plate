import { KEYS } from 'platejs';

import * as setListNodeModule from './setListNode';
import { setListNodes } from './setListNodes';

describe('setListNodes', () => {
  afterEach(() => {
    mock.restore();
  });

  it('increments indent for non-list blocks before applying list metadata', () => {
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

    setListNodes(editor, [[{ [KEYS.indent]: 1, type: KEYS.p }, [0]]] as any, {
      listStyleType: 'decimal',
    });

    expect(unsetNodes).toHaveBeenCalledWith(KEYS.listChecked, { at: [0] });
    expect(setListNodeSpy).toHaveBeenCalledWith(editor, {
      at: [0],
      indent: 2,
      listStyleType: 'decimal',
    });
    expect(setIndentTodoNodeSpy).not.toHaveBeenCalled();
  });

  it('uses todo helpers when the target style is todo', () => {
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

    setListNodes(
      editor,
      [
        [{ [KEYS.indent]: 3, [KEYS.listChecked]: true, type: KEYS.p }, [2]],
      ] as any,
      { listStyleType: 'todo' }
    );

    expect(unsetNodes).toHaveBeenCalledWith(KEYS.listType, { at: [2] });
    expect(setIndentTodoNodeSpy).toHaveBeenCalledWith(editor, {
      at: [2],
      indent: 3,
      listStyleType: 'todo',
    });
    expect(setListNodeSpy).not.toHaveBeenCalled();
  });
});
