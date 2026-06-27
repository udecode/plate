import * as getSelectedDomNodeModule from './getSelectedDomNode';
import { isSelectOutside } from './isSelectOutside';

describe('isSelectOutside', () => {
  let mockGetSelectedDomNode: ReturnType<typeof mock>;
  let getSelectedDomNodeSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    mockGetSelectedDomNode = mock();
    getSelectedDomNodeSpy = spyOn(
      getSelectedDomNodeModule,
      'getSelectedDomNode'
    ).mockImplementation(mockGetSelectedDomNode);
  });

  afterEach(() => {
    getSelectedDomNodeSpy?.mockRestore();
  });

  describe('when HTML element is provided', () => {
    it('returns true when element contains data-plite-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.dataset.pliteEditor = 'true';
      mockDiv.append(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('returns false when element does not contain data-plite-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const innerElement = document.createElement('p');
      innerElement.textContent = 'Some text';
      mockDiv.append(innerElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('returns false for empty element', () => {
      const mockDiv = document.createElement('div');

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).not.toHaveBeenCalled();
    });

    it('check nested elements for data-plite-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const wrapper = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.dataset.pliteEditor = 'true';
      wrapper.append(editorElement);
      mockDiv.append(wrapper);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });

  describe('when HTML element is not provided', () => {
    it('call getSelectedDomNode and return true if selection contains editor', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      editorElement.dataset.pliteEditor = 'true';
      mockDiv.append(editorElement);
      mockGetSelectedDomNode.mockReturnValue(mockDiv);
      const result = isSelectOutside();

      expect(result).toBe(true);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('returns false when getSelectedDomNode returns null', () => {
      mockGetSelectedDomNode.mockReturnValue(null);
      const result = isSelectOutside();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('returns false when getSelectedDomNode returns undefined', () => {
      mockGetSelectedDomNode.mockReturnValue(undefined);
      const result = isSelectOutside();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });

    it('returns false when selection does not contain editor', () => {
      const mockDiv = document.createElement('div');
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Regular content';
      mockDiv.append(paragraph);
      mockGetSelectedDomNode.mockReturnValue(mockDiv);
      const result = isSelectOutside();

      expect(result).toBe(false);
      expect(mockGetSelectedDomNode).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handle malformed selector gracefully', () => {
      const mockDiv = document.createElement('div');
      // Override querySelector to throw an error
      const originalQuerySelector = mockDiv.querySelector;
      mockDiv.querySelector = mock(() => {
        throw new Error('Invalid selector');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => isSelectOutside(mockDiv)).toThrow('Invalid selector');

      // Restore original method
      mockDiv.querySelector = originalQuerySelector;
    });

    it('handle elements with data-plite-editor attribute', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      // The querySelector in the source has a missing closing bracket: '[data-plite-editor="true"'
      // This means it will match any element with data-plite-editor that starts with "true"
      editorElement.dataset.pliteEditor = 'true';
      mockDiv.append(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });

    it('does not match elements with data-plite-editor set to other values', () => {
      const mockDiv = document.createElement('div');
      const editorElement = document.createElement('div');
      // Due to the missing closing bracket, this won't match
      editorElement.dataset.pliteEditor = 'false';
      mockDiv.append(editorElement);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(false);
    });

    it('handle multiple editor elements', () => {
      const mockDiv = document.createElement('div');
      const editor1 = document.createElement('div');
      editor1.dataset.pliteEditor = 'true';
      const editor2 = document.createElement('div');
      editor2.dataset.pliteEditor = 'true';
      mockDiv.append(editor1);
      mockDiv.append(editor2);

      const result = isSelectOutside(mockDiv);

      expect(result).toBe(true);
    });
  });
});
