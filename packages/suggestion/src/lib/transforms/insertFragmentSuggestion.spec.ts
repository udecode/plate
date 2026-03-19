import { KEYS } from 'platejs';

import * as deleteFragmentModule from './deleteFragmentSuggestion';
import * as queryModule from '../queries';
import { getSuggestionKey } from '../utils';
import { insertFragmentSuggestion } from './insertFragmentSuggestion';

describe('insertFragmentSuggestion', () => {
  it('rewrites fragment nodes with the active insert suggestion metadata', () => {
    const deleteFragmentSuggestion = (): undefined => {};
    const deleteFragmentSpy = spyOn(
      deleteFragmentModule,
      'deleteFragmentSuggestion'
    ).mockImplementation(deleteFragmentSuggestion);
    const findSuggestionPropsSpy = spyOn(
      queryModule,
      'findSuggestionProps'
    ).mockReturnValue({
      createdAt: 42,
      id: 'suggestion-1',
    } as any);
    const insertFragment = mock();
    const withoutSuggestions = mock((fn: () => void) => fn());
    const editor = {
      getApi: () => ({
        suggestion: {
          withoutSuggestions,
        },
      }),
      getOptions: () => ({ currentUserId: 'user-1' }),
      selection: { anchor: { offset: 0, path: [0, 0] } },
      tf: {
        insertFragment,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;
    const fragment = [
      {
        [KEYS.suggestion]: true,
        [getSuggestionKey('other-user')]: { id: 'other-user' },
        text: 'text',
      },
      {
        children: [{ text: '' }],
        type: 'p',
      },
    ] as any;

    insertFragmentSuggestion(editor, fragment);

    expect(deleteFragmentSpy).toHaveBeenCalledWith(editor);
    expect(fragment[0][KEYS.suggestion]).toBe(true);
    expect(fragment[0][getSuggestionKey('other-user')]).toBeUndefined();
    expect(fragment[0][getSuggestionKey('suggestion-1')]).toEqual({
      createdAt: 42,
      id: 'suggestion-1',
      type: 'insert',
      userId: 'user-1',
    });
    expect(fragment[1][KEYS.suggestion]).toEqual({
      createdAt: 42,
      id: 'suggestion-1',
      type: 'insert',
      userId: 'user-1',
    });
    expect(withoutSuggestions).toHaveBeenCalledTimes(1);
    expect(insertFragment).toHaveBeenCalledWith(fragment);

    deleteFragmentSpy.mockRestore();
    findSuggestionPropsSpy.mockRestore();
  });
});
