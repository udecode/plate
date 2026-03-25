import { DOMEditor } from 'slate-dom';

import { isTargetInsideNonReadonlyVoid } from './isTargetInsideNonReadonlyVoid';

describe('isTargetInsideNonReadonlyVoid', () => {
  it('returns the slate-dom result when the lookup succeeds', () => {
    const target = new EventTarget();
    const domEditorSpy = spyOn(
      DOMEditor,
      'isTargetInsideNonReadonlyVoid'
    ).mockReturnValueOnce(true);

    try {
      expect(isTargetInsideNonReadonlyVoid({} as any, target)).toBe(true);
    } finally {
      domEditorSpy.mockRestore();
    }
  });

  it('returns false when slate-dom throws', () => {
    const target = new EventTarget();
    const domEditorSpy = spyOn(
      DOMEditor,
      'isTargetInsideNonReadonlyVoid'
    ).mockImplementation(() => {
      throw new Error('boom');
    });

    try {
      expect(isTargetInsideNonReadonlyVoid({} as any, target)).toBe(false);
    } finally {
      domEditorSpy.mockRestore();
    }
  });
});
