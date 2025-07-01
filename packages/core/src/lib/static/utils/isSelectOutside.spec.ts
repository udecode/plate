import { getSelectedDomNode } from './getSelectedDomNode';
import { isSelectOutside } from './isSelectOutside';

jest.mock('./getSelectedDomNode');

describe('isSelectOutside', () => {
  const mockGetSelectedDomNode = getSelectedDomNode as jest.MockedFunction<typeof getSelectedDomNode>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with provided HTML element', () => {
    it('should return true if element contains data-slate-editor', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div data-slate-editor="true">Editor content</div>';

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('should return false if element does not contain data-slate-editor', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<p>Regular content</p>';

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('should handle nested data-slate-editor attribute', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div><span><div data-slate-editor="true">Editor</div></span></div>';

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });

  describe('without provided HTML element', () => {
    it('should use getSelectedDomNode and return true if editor found', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div data-slate-editor="true">Editor content</div>';
      mockGetSelectedDomNode.mockReturnValue(mockDiv);

      const result = isSelectOutside();

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('should use getSelectedDomNode and return false if no editor found', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<p>Regular content</p>';
      mockGetSelectedDomNode.mockReturnValue(mockDiv);

      const result = isSelectOutside();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('should return false if getSelectedDomNode returns undefined', () => {
      mockGetSelectedDomNode.mockReturnValue(undefined);

      const result = isSelectOutside();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle malformed selector query', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div data-slate-editor="true>Unclosed quote</div>';

      // The querySelector with unclosed quote should find the element
      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });

    it('should handle empty element', () => {
      const mockDiv = document.createElement('div');

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
    });

    it('should handle data-slate-editor with different values', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div data-slate-editor="false">Not an editor</div>';

      // querySelector looks for the attribute presence, not value
      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });
});