import * as matchPointsModule from '../utils/getMatchPoints';
import * as matchRangeModule from '../utils/getMatchRange';
import { autoformatText, type AutoformatTextOptions } from './autoformatText';

const createOptions = (
  overrides: Partial<AutoformatTextOptions> = {}
): AutoformatTextOptions => ({
  format: '—',
  match: '--',
  mode: 'text',
  text: '-',
  trigger: '-',
  ...overrides,
});

describe('autoformatText', () => {
  it('returns false when the trigger does not match', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '-',
      start: '--',
      triggers: ['!'],
    });

    expect(
      autoformatText({ selection: { anchor: {} } } as any, createOptions())
    ).toBe(false);

    rangeSpy.mockRestore();
  });

  it('delegates to a formatter callback when provided', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '*',
      start: '*',
      triggers: ['*'],
    });
    const matched = {
      afterStartMatchPoint: { offset: 1, path: [0, 0] } as any,
      beforeEndMatchPoint: { offset: 6, path: [0, 0] } as any,
      beforeStartMatchPoint: { offset: 0, path: [0, 0] } as any,
    };
    const pointsSpy = spyOn(
      matchPointsModule,
      'getMatchPoints'
    ).mockReturnValue(matched);
    const del = mock();
    const formatCalls: any[] = [];
    const format: Extract<AutoformatTextOptions['format'], Function> = (
      currentEditor,
      options
    ) => {
      formatCalls.push([currentEditor, options]);
    };
    const editor = {
      selection: {
        anchor: { offset: 7, path: [0, 0] },
      },
      tf: {
        delete: del,
      },
    } as any;

    expect(
      autoformatText(
        editor,
        createOptions({
          format,
          match: '*',
          text: '*',
          trigger: '*',
        })
      )
    ).toBe(true);

    expect(del).toHaveBeenCalledTimes(1);
    expect(formatCalls).toEqual([[editor, matched]]);

    rangeSpy.mockRestore();
    pointsSpy.mockRestore();
  });

  it('inserts formatted delimiters when using a tuple format', () => {
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
    const del = mock();
    const insertText = mock();
    const editor = {
      selection: {
        anchor: { offset: 5, path: [0, 0] },
      },
      tf: {
        delete: del,
        insertText,
      },
    } as any;

    expect(
      autoformatText(
        editor,
        createOptions({
          format: ['(', ')'],
          match: '*',
          text: '*',
          trigger: '*',
        })
      )
    ).toBe(true);

    expect(insertText).toHaveBeenNthCalledWith(1, ')');
    expect(del).toHaveBeenCalledTimes(2);
    expect(insertText).toHaveBeenNthCalledWith(2, '(', {
      at: { offset: 0, path: [0, 0] },
    });

    rangeSpy.mockRestore();
    pointsSpy.mockRestore();
  });
});
