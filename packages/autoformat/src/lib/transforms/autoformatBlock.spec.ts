import { KEYS } from 'platejs';

import * as matchRangeModule from '../utils/getMatchRange';
import {
  autoformatBlock,
  type AutoformatBlockOptions,
} from './autoformatBlock';

const createOptions = (
  overrides: Partial<AutoformatBlockOptions> = {}
): AutoformatBlockOptions => ({
  match: '##',
  mode: 'block',
  text: '#',
  trigger: '#',
  ...overrides,
});

describe('autoformatBlock', () => {
  it('returns false when the trigger does not match', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['!'],
    });

    expect(autoformatBlock({ selection: {} } as any, createOptions())).toBe(
      false
    );

    rangeSpy.mockRestore();
  });

  it('returns false when a void node is inside the match range', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['#'],
    });
    const editor = {
      api: {
        range: mock(() => ({ anchor: {}, focus: {} })),
        some: mock(() => true),
        string: mock(),
      },
      selection: {},
    } as any;

    expect(autoformatBlock(editor, createOptions())).toBe(false);

    rangeSpy.mockRestore();
  });

  it('returns false when the same block type already exists above', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['#'],
    });
    const some = mock((_options: any) => {
      if (_options?.at) return false;

      return true;
    });
    const editor = {
      api: {
        isVoid: mock(() => false),
        range: mock(() => ({ anchor: {}, focus: {} })),
        some,
        string: mock(() => '##'),
      },
      selection: {},
    } as any;

    expect(
      autoformatBlock(
        editor,
        createOptions({
          type: KEYS.h2,
        })
      )
    ).toBe(false);

    rangeSpy.mockRestore();
  });

  it('deletes the trigger text and runs preFormat and format callbacks', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['#'],
    });
    const del = mock();
    const preFormatCalls: any[] = [];
    const formatCalls: any[] = [];
    const preFormat: NonNullable<AutoformatBlockOptions['preFormat']> = (
      currentEditor
    ) => {
      preFormatCalls.push(currentEditor);
    };
    const format: NonNullable<AutoformatBlockOptions['format']> = (
      currentEditor,
      ctx
    ) => {
      formatCalls.push([currentEditor, ctx]);
    };
    const editor = {
      api: {
        isBlock: mock(() => true),
        isVoid: mock(() => false),
        range: mock(() => ({ anchor: { offset: 0 }, focus: { offset: 2 } })),
        some: mock((_options: any) => {
          if (_options?.at) return false;

          return false;
        }),
        string: mock(() => '##'),
      },
      selection: {},
      tf: {
        delete: del,
        setNodes: mock(),
      },
    } as any;

    expect(
      autoformatBlock(
        editor,
        createOptions({
          format,
          preFormat,
        })
      )
    ).toBe(true);

    expect(del).toHaveBeenCalledWith({
      at: { anchor: { offset: 0 }, focus: { offset: 2 } },
    });
    expect(preFormatCalls).toEqual([editor]);
    expect(formatCalls).toEqual([[editor, { matchString: '##' }]]);

    rangeSpy.mockRestore();
  });

  it('uses the before-range path and setNodes when formatting is allowed mid-block', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['#'],
    });
    const deleteNodes = mock();
    const setNodes = mock();
    const editor = {
      api: {
        isBlock: mock(() => true),
        range: mock((location: string) => {
          if (location === 'before') {
            return { anchor: { offset: 1 }, focus: { offset: 3 } };
          }

          return;
        }),
        some: mock(() => false),
        string: mock(() => '##'),
      },
      selection: {},
      tf: {
        delete: deleteNodes,
        setNodes,
      },
    } as any;

    expect(
      autoformatBlock(
        editor,
        createOptions({
          triggerAtBlockStart: false,
          type: KEYS.h2,
        })
      )
    ).toBe(true);

    expect(deleteNodes).toHaveBeenCalledWith({
      at: { anchor: { offset: 1 }, focus: { offset: 3 } },
    });
    expect(setNodes).toHaveBeenCalledWith(
      { type: KEYS.h2 },
      { match: expect.any(Function) }
    );

    rangeSpy.mockRestore();
  });

  it('formats even when the same block type exists above if explicitly allowed', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '##',
      start: '',
      triggers: ['#'],
    });
    const setNodes = mock();
    const editor = {
      api: {
        isBlock: mock(() => true),
        isVoid: mock(() => false),
        range: mock(() => ({ anchor: { offset: 0 }, focus: { offset: 2 } })),
        some: mock((_options: any) => {
          if (_options?.at) return false;

          return true;
        }),
        string: mock(() => '##'),
      },
      selection: {},
      tf: {
        delete: mock(),
        setNodes,
      },
    } as any;

    expect(
      autoformatBlock(
        editor,
        createOptions({
          allowSameTypeAbove: true,
          type: KEYS.h2,
        })
      )
    ).toBe(true);

    expect(setNodes).toHaveBeenCalled();

    rangeSpy.mockRestore();
  });

  it('does not delete unrelated text for single-character matches', () => {
    const rangeSpy = spyOn(matchRangeModule, 'getMatchRange').mockReturnValue({
      end: '#',
      start: '',
      triggers: ['#'],
    });
    const deleteNodes = mock();
    const setNodes = mock();
    const editor = {
      api: {
        isBlock: mock(() => true),
        isVoid: mock(() => false),
        range: mock(() => ({ anchor: { offset: 0 }, focus: { offset: 1 } })),
        some: mock((_options: any) => {
          if (_options?.at) return false;

          return false;
        }),
        string: mock(() => '#'),
      },
      selection: {},
      tf: {
        delete: deleteNodes,
        setNodes,
      },
    } as any;

    expect(
      autoformatBlock(
        editor,
        createOptions({
          match: '#',
          type: KEYS.h1,
        })
      )
    ).toBe(true);

    expect(deleteNodes).not.toHaveBeenCalled();
    expect(setNodes).toHaveBeenCalledWith(
      { type: KEYS.h1 },
      { match: expect.any(Function) }
    );

    rangeSpy.mockRestore();
  });
});
