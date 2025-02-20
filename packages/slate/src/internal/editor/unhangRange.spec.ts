import type { TRange } from '../../interfaces/range';

import { createEditor } from '../../create-editor';

describe('unhangRange', () => {
  const editor = createEditor();

  describe('when character is true', () => {
    it('should return same range if paths are equal', () => {
      const range: TRange = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      };

      const result = editor.api.unhangRange(range, { character: true });

      expect(result).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    });

    it('should move end point forward if offset is 0', () => {
      const range: TRange = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 0, path: [0, 1] },
      };

      // Mock editor.api.after to simulate point after start
      const pointAfter = { offset: 2, path: [0, 0] };
      jest.spyOn(editor.api, 'after').mockImplementation(() => pointAfter);

      const result = editor.api.unhangRange(range, { character: true });

      expect(result).toEqual({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
    });

    it('should move start point backward if end offset is not 0', () => {
      const range: TRange = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 1] },
      };

      // Mock editor.api.before to simulate point before end
      const pointBefore = { offset: 0, path: [0, 1] };
      jest.spyOn(editor.api, 'before').mockImplementation(() => pointBefore);

      const result = editor.api.unhangRange(range, { character: true });

      expect(result).toEqual({
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 1, path: [0, 1] },
      });
    });

    it('should return original range if no valid points found', () => {
      const range: TRange = {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 0, path: [0, 1] },
      };

      // Mock editor.api.after to return undefined
      jest.spyOn(editor.api, 'after').mockImplementation((() => {}) as any);

      const result = editor.api.unhangRange(range, { character: true });

      expect(result).toEqual(range);
    });
  });

  describe('when character is false or undefined', () => {
    it('should return original range when unhang is false', () => {
      const range: TRange = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 1] },
      };

      const result = editor.api.unhangRange(range, { unhang: false });

      expect(result).toEqual(range);
    });
  });
});
