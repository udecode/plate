import { isSelectOutside } from './isSelectOutside';

describe('isSelectOutside', () => {
  let mockGetSelectedDomNode: jest.Mock;

  beforeEach(() => {
    mockGetSelectedDomNode = jest.fn();
    jest.doMock('./getSelectedDomNode', () => ({
      getSelectedDomNode: mockGetSelectedDomNode,
    }));
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('when HTML element is provided', () => {
    it('should return true when element contains data-slate-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.setAttribute('data-slate-editor', 'true');
      mockDiv.appendChild(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('should return false when element does not contain data-slate-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const innerElement = document.createElement('p');
      innerElement.textContent = 'Some text';
      mockDiv.appendChild(innerElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('should return false for empty element', () => {
      const mockDiv = document.createElement('div');

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('should check nested elements for data-slate-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const wrapper = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.setAttribute('data-slate-editor', 'true');
      wrapper.appendChild(editorElement);
      mockDiv.appendChild(wrapper);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });

  describe('when HTML element is not provided', () => {
    it('should call getSelectedDomNode and return true if selection contains editor', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.setAttribute('data-slate-editor', 'true');
      mockDiv.appendChild(editorElement);
      mockGetSelectedDomNode.mockReturnValue(mockDiv);

      // Need to re-import after mocking
      jest.resetModules();
      jest.doMock('./getSelectedDomNode', () => ({
        getSelectedDomNode: mockGetSelectedDomNode,
      }));
      const { isSelectOutside: isSelectOutsideWithMock } = require('./isSelectOutside');

      const result = isSelectOutsideWithMock();

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('should return false when getSelectedDomNode returns null', () => {
      mockGetSelectedDomNode.mockReturnValue(null);

      // Need to re-import after mocking
      jest.resetModules();
      jest.doMock('./getSelectedDomNode', () => ({
        getSelectedDomNode: mockGetSelectedDomNode,
      }));
      const { isSelectOutside: isSelectOutsideWithMock } = require('./isSelectOutside');

      const result = isSelectOutsideWithMock();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('should return false when getSelectedDomNode returns undefined', () => {
      mockGetSelectedDomNode.mockReturnValue(undefined);

      // Need to re-import after mocking
      jest.resetModules();
      jest.doMock('./getSelectedDomNode', () => ({
        getSelectedDomNode: mockGetSelectedDomNode,
      }));
      const { isSelectOutside: isSelectOutsideWithMock } = require('./isSelectOutside');

      const result = isSelectOutsideWithMock();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('should return false when selection does not contain editor', () => {
      const mockDiv = document.createElement('div');
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Regular content';
      mockDiv.appendChild(paragraph);
      mockGetSelectedDomNode.mockReturnValue(mockDiv);

      // Need to re-import after mocking
      jest.resetModules();
      jest.doMock('./getSelectedDomNode', () => ({
        getSelectedDomNode: mockGetSelectedDomNode,
      }));
      const { isSelectOutside: isSelectOutsideWithMock } = require('./isSelectOutside');

      const result = isSelectOutsideWithMock();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle malformed selector gracefully', () => {
      const mockDiv = document.createElement('div');
      // Override querySelector to throw an error
      const originalQuerySelector = mockDiv.querySelector;
      mockDiv.querySelector = jest.fn(() => {
        throw new Error('Invalid selector');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => isSelectOutside(mockDiv)).toThrow('Invalid selector');
      
      // Restore original method
      mockDiv.querySelector = originalQuerySelector;
    });

    it('should handle elements with data-slate-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      // The querySelector in the source has a missing closing bracket: '[data-slate-editor="true"'
      // This means it will match any element with data-slate-editor that starts with "true"
      editorElement.setAttribute('data-slate-editor', 'true');
      mockDiv.appendChild(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });

    it('should not match elements with data-slate-editor set to other values', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      // Due to the missing closing bracket, this won't match
      editorElement.setAttribute('data-slate-editor', 'false');
      mockDiv.appendChild(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
    });

    it('should handle multiple editor elements', () => {
      const mockDiv = document.createElement('div');
      const editor1 = document.createElement('div');
      editor1.setAttribute('data-slate-editor', 'true');
      const editor2 = document.createElement('div');
      editor2.setAttribute('data-slate-editor', 'true');
      mockDiv.appendChild(editor1);
      mockDiv.appendChild(editor2);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });
});