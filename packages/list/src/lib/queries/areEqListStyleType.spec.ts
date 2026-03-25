import { KEYS } from 'platejs';

import { areEqListStyleType } from './areEqListStyleType';

describe('areEqListStyleType', () => {
  it('returns true when every entry matches the requested list style type', () => {
    expect(
      areEqListStyleType(
        {} as any,
        [
          [{ [KEYS.listType]: 'disc' }, [0]],
          [{ [KEYS.listType]: 'disc' }, [1]],
        ] as any,
        { listStyleType: 'disc' }
      )
    ).toBe(true);
  });

  it('treats todo lists as entries with a checked flag', () => {
    expect(
      areEqListStyleType(
        {} as any,
        [
          [{ [KEYS.listChecked]: true }, [0]],
          [{ [KEYS.listChecked]: false }, [1]],
        ] as any,
        { listStyleType: KEYS.listTodo }
      )
    ).toBe(true);
  });

  it('returns false when a todo entry is missing the checked flag', () => {
    expect(
      areEqListStyleType(
        {} as any,
        [
          [{ [KEYS.listChecked]: true }, [0]],
          [{ text: 'plain' }, [1]],
        ] as any,
        { listStyleType: KEYS.listTodo }
      )
    ).toBe(false);
  });
});
