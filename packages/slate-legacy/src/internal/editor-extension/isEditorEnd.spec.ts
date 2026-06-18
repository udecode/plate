import { isEditorEnd } from './isEditorEnd';

describe('isEditorEnd', () => {
  it('returns false when the editor has no selection', () => {
    expect(isEditorEnd({ selection: null } as any)).toBe(false);
  });

  it('returns true when the focus is at the editor end boundary', () => {
    expect(
      isEditorEnd({
        api: {
          end: () => ({ offset: 0, path: [1] }),
          isEnd: () => true,
        },
        selection: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
      } as any)
    ).toBe(true);
  });

  it('returns false when the focus is not at the matching editor boundary', () => {
    expect(
      isEditorEnd({
        api: {
          end: () => ({ offset: 0, path: [2] }),
          isEnd: () => false,
        },
        selection: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
      } as any)
    ).toBe(false);
  });
});
