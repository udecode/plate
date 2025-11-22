import { getSelectedDomBlocks } from './getSelectedDomBlocks';

describe('getSelectedDomBlocks', () => {
  let mockSelection: Selection;
  let mockRange: Range;
  let originalGetSelection: typeof window.getSelection;

  beforeEach(() => {
    // Store original getSelection
    originalGetSelection = window.getSelection;

    // Create mock range
    mockRange = {
      cloneContents: mock(),
    } as any;

    // Create mock selection
    mockSelection = {
      getRangeAt: mock(() => mockRange),
      rangeCount: 1,
    } as any;

    // Mock window.getSelection
    window.getSelection = mock(() => mockSelection);
  });

  afterEach(() => {
    // Restore original getSelection
    window.getSelection = originalGetSelection;
  });

  describe('when selection exists', () => {
    it('should return array of slate blocks with data attributes', () => {
      const mockFragment = document.createDocumentFragment();

      // Create slate blocks
      const block1 = document.createElement('div');
      block1.dataset.slateNode = 'element';
      block1.dataset.slateId = 'block-1';
      block1.textContent = 'First block';

      const block2 = document.createElement('div');
      block2.dataset.slateNode = 'element';
      block2.dataset.slateId = 'block-2';
      block2.textContent = 'Second block';

      mockFragment.append(block1);
      mockFragment.append(block2);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result?.[0]).toBe(block1);
      expect(result?.[1]).toBe(block2);
      expect((result?.[0] as HTMLElement).dataset.slateId).toBe('block-1');
      expect((result?.[1] as HTMLElement).dataset.slateId).toBe('block-2');
    });

    it('should filter out non-slate elements', () => {
      const mockFragment = document.createDocumentFragment();

      // Create mixed elements
      const regularDiv = document.createElement('div');
      regularDiv.textContent = 'Regular div';

      const slateBlock = document.createElement('div');
      slateBlock.dataset.slateNode = 'element';
      slateBlock.dataset.slateId = 'block-1';

      const paragraph = document.createElement('p');
      paragraph.textContent = 'Regular paragraph';

      mockFragment.append(regularDiv);
      mockFragment.append(slateBlock);
      mockFragment.append(paragraph);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toBe(slateBlock);
    });

    it('should handle nested slate blocks', () => {
      const mockFragment = document.createDocumentFragment();

      const parentBlock = document.createElement('div');
      parentBlock.dataset.slateNode = 'element';
      parentBlock.dataset.slateId = 'parent-1';

      const childBlock = document.createElement('div');
      childBlock.dataset.slateNode = 'element';
      childBlock.dataset.slateId = 'child-1';

      parentBlock.append(childBlock);
      mockFragment.append(parentBlock);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result?.[0]).toBe(parentBlock);
      expect(result?.[1]).toBe(childBlock);
    });

    it('should return empty array when no slate blocks found', () => {
      const mockFragment = document.createDocumentFragment();

      const regularDiv = document.createElement('div');
      regularDiv.textContent = 'No slate attributes';

      mockFragment.append(regularDiv);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should handle blocks with only data-slate-node attribute', () => {
      const mockFragment = document.createDocumentFragment();

      const block = document.createElement('div');
      block.dataset.slateNode = 'element';
      // Missing data-slate-id

      mockFragment.append(block);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should not include blocks without data-slate-id
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should handle blocks with only data-slate-id attribute', () => {
      const mockFragment = document.createDocumentFragment();

      const block = document.createElement('div');
      block.dataset.slateId = 'block-1';
      // Missing data-slate-node="element"

      mockFragment.append(block);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should not include blocks without data-slate-node="element"
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should handle empty fragment', () => {
      const mockFragment = document.createDocumentFragment();
      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('when selection does not exist', () => {
    it('should return undefined when getSelection returns null', () => {
      window.getSelection = mock(() => null);

      const result = getSelectedDomBlocks();

      expect(result).toBeUndefined();
    });

    it('should return undefined when rangeCount is 0', () => {
      (mockSelection as any).rangeCount = 0;

      const result = getSelectedDomBlocks();

      expect(result).toBeUndefined();
      expect(mockSelection.getRangeAt).not.toHaveBeenCalled();
    });

    it('should handle negative rangeCount', () => {
      (mockSelection as any).rangeCount = -1;
      // Mock cloneContents to return a valid fragment
      const mockFragment = document.createDocumentFragment();
      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // The function doesn't check for negative rangeCount, so it will try to getRangeAt(0)
      // and process normally, returning an empty array since fragment has no matching elements
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle slate blocks with different node types', () => {
      const mockFragment = document.createDocumentFragment();

      const textNode = document.createElement('span');
      textNode.dataset.slateNode = 'text';
      textNode.dataset.slateId = 'text-1';

      const elementNode = document.createElement('div');
      elementNode.dataset.slateNode = 'element';
      elementNode.dataset.slateId = 'element-1';

      mockFragment.append(textNode);
      mockFragment.append(elementNode);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should only return elements with data-slate-node="element"
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toBe(elementNode);
    });

    it('should handle getRangeAt throwing an error', () => {
      mockSelection.getRangeAt = mock(() => {
        throw new Error('Index out of bounds');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomBlocks()).toThrow('Index out of bounds');
    });

    it('should handle cloneContents throwing an error', () => {
      mockRange.cloneContents = mock(() => {
        throw new Error('Failed to clone');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomBlocks()).toThrow('Failed to clone');
    });

    it('should handle complex DOM structures', () => {
      const mockFragment = document.createDocumentFragment();

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div data-slate-node="element" data-slate-id="1">
          <p>Content</p>
          <div data-slate-node="element" data-slate-id="2">
            <span>Nested</span>
          </div>
        </div>
        <div data-slate-node="element" data-slate-id="3">
          Another block
        </div>
      `;

      // Move children to fragment
      while (wrapper.firstChild) {
        mockFragment.append(wrapper.firstChild);
      }

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      expect((result?.[0] as HTMLElement).dataset.slateId).toBe('1');
      expect((result?.[1] as HTMLElement).dataset.slateId).toBe('2');
      expect((result?.[2] as HTMLElement).dataset.slateId).toBe('3');
    });

    it('should preserve order of blocks', () => {
      const mockFragment = document.createDocumentFragment();

      for (let i = 1; i <= 5; i++) {
        const block = document.createElement('div');
        block.dataset.slateNode = 'element';
        block.dataset.slateId = `block-${i}`;
        mockFragment.append(block);
      }

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect((result?.[i] as HTMLElement).dataset.slateId).toBe(
          `block-${i + 1}`
        );
      }
    });
  });
});
