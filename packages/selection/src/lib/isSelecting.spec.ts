import { isSelecting } from './isSelecting';

describe('isSelecting', () => {
  it('returns true when the editor selection is expanded', () => {
    const editor = {
      api: {
        isExpanded: () => true,
      },
      getOption: () => false,
    } as any;

    expect(isSelecting(editor)).toBe(true);
  });

  it('returns true when block selection says some blocks are being selected', () => {
    const editor = {
      api: {
        isExpanded: () => false,
      },
      getOption: () => true,
    } as any;

    expect(isSelecting(editor)).toBe(true);
  });

  it('returns false when neither selection state is active', () => {
    const editor = {
      api: {
        isExpanded: () => false,
      },
      getOption: () => false,
    } as any;

    expect(isSelecting(editor)).toBe(false);
  });
});
