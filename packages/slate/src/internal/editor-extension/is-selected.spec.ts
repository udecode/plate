import type { Range, Value } from '../../interfaces';

import { createEditor } from '../../create-editor';
import { isSelected } from './is-selected';

describe('isSelected', () => {
  it('should return false when no selection', () => {
    const editor = createEditor<Value>({
      children: [{ children: [{ text: 'test' }], type: 'p' }],
    });
    editor.selection = null;

    expect(isSelected(editor, [0])).toBe(false);
  });

  it('should return true when selection intersects with path', () => {
    const editor = createEditor<Value>({
      children: [{ children: [{ text: 'test' }], type: 'p' }],
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });

    expect(isSelected(editor, [0])).toBe(true);
  });

  it('should return false when selection does not intersect with path', () => {
    const editor = createEditor<Value>({
      children: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    expect(isSelected(editor, [1])).toBe(false);
  });

  describe('contains option', () => {
    it('should return true when selection fully contains path', () => {
      const editor = createEditor<Value>({
        children: [{ children: [{ text: 'test' }], type: 'p' }],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
      });

      expect(isSelected(editor, [0], { contains: true })).toBe(true);
    });

    it('should return false when selection partially contains path', () => {
      const editor = createEditor<Value>({
        children: [{ children: [{ text: 'test' }], type: 'p' }],
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });

      expect(isSelected(editor, [0], { contains: true })).toBe(false);
    });

    it('should return false when selection is outside path', () => {
      const editor = createEditor<Value>({
        children: [
          { children: [{ text: 'one' }], type: 'p' },
          { children: [{ text: 'two' }], type: 'p' },
        ],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
      });

      expect(isSelected(editor, [1], { contains: true })).toBe(false);
    });
  });

  describe('range input', () => {
    it('should return true when selection intersects with range', () => {
      const editor = createEditor<Value>({
        children: [{ children: [{ text: 'test' }], type: 'p' }],
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });

      const range: Range = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      };

      expect(isSelected(editor, range)).toBe(true);
    });

    it('should return false when selection does not intersect with range', () => {
      const editor = createEditor<Value>({
        children: [{ children: [{ text: 'test' }], type: 'p' }],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      });

      const range: Range = {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      };

      expect(isSelected(editor, range)).toBe(false);
    });

    describe('contains option', () => {
      it('should return true when selection fully contains range', () => {
        const editor = createEditor<Value>({
          children: [{ children: [{ text: 'test' }], type: 'p' }],
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
        });

        const range: Range = {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        };

        expect(isSelected(editor, range, { contains: true })).toBe(true);
      });

      it('should return false when selection partially contains range', () => {
        const editor = createEditor<Value>({
          children: [{ children: [{ text: 'test' }], type: 'p' }],
          selection: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
        });

        const range: Range = {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        };

        expect(isSelected(editor, range, { contains: true })).toBe(false);
      });
    });
  });
});
