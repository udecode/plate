import * as indentModule from '@platejs/indent';
import { KEYS } from 'platejs';

import { indentList, indentTodo } from './indentList';

describe('indentList helpers', () => {
  afterEach(() => {
    mock.restore();
  });

  it('configures setIndent for standard lists', () => {
    const spy = spyOn(indentModule, 'setIndent').mockImplementation(() => {});
    const editor = {} as any;

    indentList(editor, {
      at: [0],
      listRestart: 5,
      listStyleType: 'square',
    });

    expect(spy).toHaveBeenCalledTimes(1);

    const [, options] = spy.mock.calls[0];

    expect(options.at).toEqual([0]);
    expect(options.listRestart).toBe(5);
    expect(options.offset).toBe(1);
    expect(options.setNodesProps()).toEqual({
      [KEYS.listType]: 'square',
    });
  });

  it('configures setIndent for todo lists with unchecked state', () => {
    const spy = spyOn(indentModule, 'setIndent').mockImplementation(() => {});
    const editor = {} as any;

    indentTodo(editor, {
      listStyleType: KEYS.listTodo,
    });

    expect(spy).toHaveBeenCalledTimes(1);

    const [, options] = spy.mock.calls[0];

    expect(options.offset).toBe(1);
    expect(options.setNodesProps()).toEqual({
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
    });
  });
});
