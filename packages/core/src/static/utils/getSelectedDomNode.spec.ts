import { getSelectedDomNode } from './getSelectedDomNode';

describe('getSelectedDomNode', () => {
  let mockSelection: Selection;
  let mockRange: Range;
  let originalGetSelection: typeof window.getSelection;

  beforeEach(() => {
    // Store original getSelection
    originalGetSelection = window.getSelection;

    // Create mock range
    mockRange = {
      cloneContents: jest.fn(),
    } as any;

    // Create mock selection
    mockSelection = {
      getRangeAt: jest.fn(() => mockRange),
      rangeCount: 1,
    } as any;

    // Mock window.getSelection
    window.getSelection = jest.fn(() => mockSelection);
  });

  afterEach(() => {
    // Restore original getSelection
    window.getSelection = originalGetSelection;
    jest.clearAllMocks();
  });

  describe('when selection exists', () => {
    it('should return a div containing the cloned contents', () => {
      const mockFragment = document.createDocumentFragment();
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Selected text';
      mockFragment.append(paragraph);

      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.tagName).toBe('DIV');
      expect(result?.innerHTML).toBe('<p>Selected text</p>');
      expect(window.getSelection).toHaveBeenCalled();
      expect(mockSelection.getRangeAt).toHaveBeenCalledWith(0);
      expect(mockRange.cloneContents).toHaveBeenCalled();
    });

    it('should handle multiple elements in selection', () => {
      const mockFragment = document.createDocumentFragment();
      const p1 = document.createElement('p');
      p1.textContent = 'First paragraph';
      const p2 = document.createElement('p');
      p2.textContent = 'Second paragraph';
      mockFragment.append(p1);
      mockFragment.append(p2);

      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe(
        '<p>First paragraph</p><p>Second paragraph</p>'
      );
    });

    it('should handle text nodes in selection', () => {
      const mockFragment = document.createDocumentFragment();
      const textNode = document.createTextNode('Plain text');
      mockFragment.append(textNode);

      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe('Plain text');
    });

    it('should handle empty selection', () => {
      const mockFragment = document.createDocumentFragment();
      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe('');
    });
  });

  describe('when selection does not exist', () => {
    it('should return undefined when getSelection returns null', () => {
      window.getSelection = jest.fn(() => null);

      const result = getSelectedDomNode();

      expect(result).toBeUndefined();
    });

    it('should return undefined when rangeCount is 0', () => {
      (mockSelection as any).rangeCount = 0;

      const result = getSelectedDomNode();

      expect(result).toBeUndefined();
      expect(mockSelection.getRangeAt).not.toHaveBeenCalled();
    });

    it('should handle negative rangeCount', () => {
      (mockSelection as any).rangeCount = -1;
      // Setup mock to return an empty fragment
      const emptyFragment = document.createDocumentFragment();
      emptyFragment.append(document.createTextNode('undefined'));
      mockRange.cloneContents = jest.fn(() => emptyFragment);

      const result = getSelectedDomNode();

      // The function doesn't check for negative rangeCount, so it will try to getRangeAt(0)
      // which will likely throw an error in real browsers, but our mock will return the mockRange
      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe('undefined');
    });
  });

  describe('edge cases', () => {
    it('should handle getRangeAt throwing an error', () => {
      mockSelection.getRangeAt = jest.fn(() => {
        throw new Error('Index out of bounds');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomNode()).toThrow('Index out of bounds');
    });

    it('should handle cloneContents throwing an error', () => {
      mockRange.cloneContents = jest.fn(() => {
        throw new Error('Failed to clone');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomNode()).toThrow('Failed to clone');
    });

    it('should handle complex HTML structures', () => {
      const mockFragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.innerHTML =
        '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>';
      // Append children individually to fragment
      while (div.firstChild) {
        mockFragment.append(div.firstChild);
      }

      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe(
        '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>'
      );
    });

    it('should handle selection with attributes', () => {
      const mockFragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.dataset.custom = 'value';
      div.className = 'selected-content';
      div.textContent = 'Content with attributes';
      mockFragment.append(div);

      mockRange.cloneContents = jest.fn(() => mockFragment);

      const result = getSelectedDomNode();

      expect(result).toBeDefined();
      expect(result?.innerHTML).toBe(
        '<div data-custom="value" class="selected-content">Content with attributes</div>'
      );
    });

    it('should create a new div each time', () => {
      // Need to return a new fragment each time since appendChild moves nodes
      mockRange.cloneContents = jest.fn(() => {
        const mockFragment = document.createDocumentFragment();
        mockFragment.append(document.createTextNode('Test'));
        return mockFragment;
      });

      const result1 = getSelectedDomNode();
      const result2 = getSelectedDomNode();

      expect(result1).not.toBe(result2);
      expect(result1?.innerHTML).toBe('Test');
      expect(result2?.innerHTML).toBe('Test');
    });
  });
});
