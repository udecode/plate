import * as matchPointsModule from '../utils/getMatchPoints';
import * as matchRangeModule from '../utils/getMatchRange';
import { autoformatMark, type AutoformatMarkOptions } from './autoformatMark';

const createOptions = (
  overrides: Partial<AutoformatMarkOptions> = {}
): AutoformatMarkOptions => ({
  match: '**',
  mode: 'mark',
  text: '*',
  trigger: '*',
  type: 'bold',
  ...overrides,
});

describe('autoformatMark', () => {
  it('returns false when no mark type is configured', () => {
    expect(
      autoformatMark(
        { selection: { anchor: {} } } as any,
        createOptions({
          type: undefined as any,
        })
      )
    ).toBe(false);
  });

  it('returns false when the trigger does not match', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '*',
      start: '**',
      triggers: ['!'],
    });

    expect(
      autoformatMark({ selection: { anchor: {} } } as any, createOptions())
    ).toBe(false);

    rangeSpy.mockRestore();
  });

  it('returns false when trimming is not allowed and the match has outer spaces', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '*',
      start: '*',
      triggers: ['*'],
    });
    const pointsSpy = spyOn(
      matchPointsModule,
      'getMatchPoints'
    ).mockReturnValue({
      afterStartMatchPoint: { offset: 1, path: [0, 0] } as any,
      beforeEndMatchPoint: { offset: 4, path: [0, 0] } as any,
      beforeStartMatchPoint: { offset: 0, path: [0, 0] } as any,
    });
    const editor = {
      api: {
        string: mock(() => ' hello '),
      },
      selection: {
        anchor: { offset: 5, path: [0, 0] },
      },
      tf: {},
    } as any;

    expect(
      autoformatMark(
        editor,
        createOptions({
          match: '*',
          type: 'italic',
        })
      )
    ).toBe(false);

    rangeSpy.mockRestore();
    pointsSpy.mockRestore();
  });

  it('adds marks and removes the match delimiters when the text matches', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '*',
      start: '*',
      triggers: ['*'],
    });
    const pointsSpy = spyOn(
      matchPointsModule,
      'getMatchPoints'
    ).mockReturnValue({
      afterStartMatchPoint: { offset: 1, path: [0, 0] } as any,
      beforeEndMatchPoint: { offset: 6, path: [0, 0] } as any,
      beforeStartMatchPoint: { offset: 0, path: [0, 0] } as any,
    });
    const addMark = mock();
    const collapse = mock();
    const removeMarks = mock();
    const select = mock();
    const del = mock();
    const editor = {
      api: {
        string: mock(() => 'hello'),
      },
      selection: {
        anchor: { offset: 7, path: [0, 0] },
      },
      tf: {
        addMark,
        collapse,
        delete: del,
        removeMarks,
        select,
      },
    } as any;

    expect(
      autoformatMark(
        editor,
        createOptions({
          match: '*',
          type: ['bold', 'italic'],
        })
      )
    ).toBe(true);

    expect(select).toHaveBeenCalledWith({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    });
    expect(addMark).toHaveBeenCalledWith('bold', true);
    expect(addMark).toHaveBeenCalledWith('italic', true);
    expect(collapse).toHaveBeenCalledWith({ edge: 'end' });
    expect(removeMarks).toHaveBeenCalledWith(['bold', 'italic'], {
      shouldChange: false,
    });
    expect(del).toHaveBeenCalledTimes(2);

    rangeSpy.mockRestore();
    pointsSpy.mockRestore();
  });
});
