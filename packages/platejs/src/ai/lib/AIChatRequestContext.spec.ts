import { SelectionApi } from '../../core';
import { resolveAIChatRequestContext } from './AIChatRequestContext';

describe('resolveAIChatRequestContext', () => {
  it('restores directional exact node selection independently from its range', () => {
    expect(
      resolveAIChatRequestContext({
        nodeSelection: {
          anchorPath: [1],
          focusPath: [0],
          paths: [[0], [1]],
        },
        selection: {
          anchor: { offset: 3, path: [1, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      })
    ).toEqual({
      isSelecting: true,
      selection: SelectionApi.nodes([[0], [1]], {
        anchorPath: [1],
        focusPath: [0],
      }),
    });
  });

  it('restores text selection and derives its expanded state', () => {
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    };

    expect(
      resolveAIChatRequestContext({ nodeSelection: null, selection })
    ).toEqual({
      isSelecting: true,
      selection: SelectionApi.text(selection),
    });
  });

  it('treats a collapsed exact node selection as selected', () => {
    expect(
      resolveAIChatRequestContext({
        nodeSelection: {
          anchorPath: [0],
          focusPath: [0],
          paths: [[0]],
        },
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      })
    ).toEqual({
      isSelecting: true,
      selection: SelectionApi.nodes([[0]]),
    });
  });

  it('keeps a missing selection unselected', () => {
    expect(
      resolveAIChatRequestContext({ nodeSelection: null, selection: null })
    ).toEqual({ isSelecting: false, selection: null });
  });
});
