import * as previousCharModule from './isPreviousCharacterEmpty';
import { getMatchPoints } from './getMatchPoints';

describe('getMatchPoints', () => {
  it('returns undefined when the end marker cannot be found', () => {
    const editor = {
      api: {
        before: mock(() => {}),
      },
      selection: {
        anchor: { offset: 4, path: [0, 0] },
      },
    } as any;

    expect(getMatchPoints(editor, { end: '**', start: '' })).toBeUndefined();
  });

  it('returns undefined when the start marker is not preceded by whitespace', () => {
    const previousCharSpy = spyOn(
      previousCharModule,
      'isPreviousCharacterEmpty'
    ).mockReturnValue(false);
    const editor = {
      api: {
        before: mock((_point, options) => {
          if (options?.afterMatch) {
            return { offset: 2, path: [0, 0] };
          }

          return { offset: 1, path: [0, 0] };
        }),
      },
      selection: {
        anchor: { offset: 4, path: [0, 0] },
      },
    } as any;

    expect(getMatchPoints(editor, { end: '*', start: '*' })).toBeUndefined();
    previousCharSpy.mockRestore();
  });

  it('returns all relevant points when both start and end markers match', () => {
    const previousCharSpy = spyOn(
      previousCharModule,
      'isPreviousCharacterEmpty'
    ).mockReturnValue(true);
    const before = mock((_point, options) => {
      if (
        options?.matchString === '**' &&
        (_point?.offset === 7 || _point?.anchor?.offset === 7)
      ) {
        return { offset: 5, path: [0, 0] };
      }

      if (options?.afterMatch) {
        return { offset: 2, path: [0, 0] };
      }

      return { offset: 0, path: [0, 0] };
    });
    const editor = {
      api: { before },
      selection: {
        anchor: { offset: 7, path: [0, 0] },
      },
    } as any;

    expect(getMatchPoints(editor, { end: '**', start: '**' })).toEqual({
      afterStartMatchPoint: { offset: 2, path: [0, 0] },
      beforeEndMatchPoint: { offset: 5, path: [0, 0] },
      beforeStartMatchPoint: { offset: 0, path: [0, 0] },
    });

    previousCharSpy.mockRestore();
  });
});
