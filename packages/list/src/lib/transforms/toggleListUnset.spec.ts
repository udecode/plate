import { KEYS } from 'platejs';

import * as outdentListModule from './outdentList';
import { toggleListUnset } from './toggleListUnset';

describe('toggleListUnset', () => {
  afterEach(() => {
    mock.restore();
  });

  it('unsets todo-list state and outdents todo items', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const unsetNodes = mock();
    const editor = {
      tf: { unsetNodes },
    } as any;

    expect(
      toggleListUnset(editor, [{ [KEYS.listChecked]: false }, [0]] as any, {
        listStyleType: KEYS.listTodo,
      })
    ).toBe(true);

    expect(unsetNodes).toHaveBeenCalledWith(KEYS.listChecked, { at: [0] });
    expect(outdentSpy).toHaveBeenCalledWith(editor, {
      listStyleType: KEYS.listTodo,
    });
  });

  it('unsets matching listStyleType metadata and outdents the item', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const unsetNodes = mock();
    const editor = {
      tf: { unsetNodes },
    } as any;

    expect(
      toggleListUnset(editor, [{ [KEYS.listType]: 'disc' }, [1]] as any, {
        listStyleType: 'disc',
      })
    ).toBe(true);

    expect(unsetNodes).toHaveBeenCalledWith([KEYS.listType], { at: [1] });
    expect(outdentSpy).toHaveBeenCalledWith(editor, {
      listStyleType: 'disc',
    });
  });

  it('does nothing when the requested list style does not match', () => {
    const outdentSpy = spyOn(
      outdentListModule,
      'outdentList'
    ).mockImplementation(() => {});
    const unsetNodes = mock();

    expect(
      toggleListUnset(
        { tf: { unsetNodes } } as any,
        [{ [KEYS.listType]: 'circle' }, [1]] as any,
        { listStyleType: 'disc' }
      )
    ).toBeUndefined();

    expect(unsetNodes).not.toHaveBeenCalled();
    expect(outdentSpy).not.toHaveBeenCalled();
  });
});
