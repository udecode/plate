import { KEYS } from 'platejs';

import * as indentListModule from './indentList';
import { toggleListSet } from './toggleListSet';

describe('toggleListSet', () => {
  afterEach(() => {
    mock.restore();
  });

  it('returns without changing nodes that are already lists', () => {
    const indentListSpy = spyOn(indentListModule, 'indentList');
    const indentTodoSpy = spyOn(indentListModule, 'indentTodo');

    expect(
      toggleListSet({} as any, [{ [KEYS.listType]: 'disc' }, [0]] as any, {
        listStyleType: 'disc',
      })
    ).toBeUndefined();

    expect(indentListSpy).not.toHaveBeenCalled();
    expect(indentTodoSpy).not.toHaveBeenCalled();
  });

  it('delegates todo list creation to indentTodo', () => {
    const indentTodoSpy = spyOn(
      indentListModule,
      'indentTodo'
    ).mockImplementation(() => {});
    const indentListSpy = spyOn(
      indentListModule,
      'indentList'
    ).mockImplementation(() => {});
    const editor = {} as any;

    expect(
      toggleListSet(editor, [{ type: KEYS.p }, [0]] as any, {
        at: [0],
        listStyleType: 'todo',
      })
    ).toBe(true);

    expect(indentTodoSpy).toHaveBeenCalledWith(editor, {
      at: [0],
      listStyleType: 'todo',
    });
    expect(indentListSpy).not.toHaveBeenCalled();
  });

  it('delegates normal list creation to indentList', () => {
    const indentListSpy = spyOn(
      indentListModule,
      'indentList'
    ).mockImplementation(() => {});
    const indentTodoSpy = spyOn(
      indentListModule,
      'indentTodo'
    ).mockImplementation(() => {});
    const editor = {} as any;

    expect(
      toggleListSet(editor, [{ type: KEYS.p }, [0]] as any, {
        listStyleType: 'decimal',
      })
    ).toBe(true);

    expect(indentListSpy).toHaveBeenCalledWith(editor, {
      listStyleType: 'decimal',
    });
    expect(indentTodoSpy).not.toHaveBeenCalled();
  });
});
