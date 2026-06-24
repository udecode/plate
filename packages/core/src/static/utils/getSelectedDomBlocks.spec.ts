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
    it('returns array of plite blocks with data attributes', () => {
      const mockFragment = document.createDocumentFragment();

      // Create plite blocks
      const block1 = document.createElement('div');
      block1.dataset.pliteNode = 'element';
      block1.dataset.pliteId = 'block-1';
      block1.textContent = 'First block';

      const block2 = document.createElement('div');
      block2.dataset.pliteNode = 'element';
      block2.dataset.pliteId = 'block-2';
      block2.textContent = 'Second block';

      mockFragment.append(block1);
      mockFragment.append(block2);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result?.[0]).toBe(block1);
      expect(result?.[1]).toBe(block2);
      expect((result?.[0] as HTMLElement).dataset.pliteId).toBe('block-1');
      expect((result?.[1] as HTMLElement).dataset.pliteId).toBe('block-2');
    });

    it('filter out non-plite elements', () => {
      const mockFragment = document.createDocumentFragment();

      // Create mixed elements
      const regularDiv = document.createElement('div');
      regularDiv.textContent = 'Regular div';

      const slateBlock = document.createElement('div');
      slateBlock.dataset.pliteNode = 'element';
      slateBlock.dataset.pliteId = 'block-1';

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

    it('handle nested plite blocks', () => {
      const mockFragment = document.createDocumentFragment();

      const parentBlock = document.createElement('div');
      parentBlock.dataset.pliteNode = 'element';
      parentBlock.dataset.pliteId = 'parent-1';

      const childBlock = document.createElement('div');
      childBlock.dataset.pliteNode = 'element';
      childBlock.dataset.pliteId = 'child-1';

      parentBlock.append(childBlock);
      mockFragment.append(parentBlock);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result?.[0]).toBe(parentBlock);
      expect(result?.[1]).toBe(childBlock);
    });

    it('returns empty array when no plite blocks found', () => {
      const mockFragment = document.createDocumentFragment();

      const regularDiv = document.createElement('div');
      regularDiv.textContent = 'No plite attributes';

      mockFragment.append(regularDiv);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('handle blocks with only data-plite-node attribute', () => {
      const mockFragment = document.createDocumentFragment();

      const block = document.createElement('div');
      block.dataset.pliteNode = 'element';
      // Missing data-plite-id

      mockFragment.append(block);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should not include blocks without data-plite-id
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('handle blocks with only data-plite-id attribute', () => {
      const mockFragment = document.createDocumentFragment();

      const block = document.createElement('div');
      block.dataset.pliteId = 'block-1';
      // Missing data-plite-node="element"

      mockFragment.append(block);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should not include blocks without data-plite-node="element"
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('handle empty fragment', () => {
      const mockFragment = document.createDocumentFragment();
      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('when selection does not exist', () => {
    it('returns undefined when getSelection returns null', () => {
      window.getSelection = mock(() => null);

      const result = getSelectedDomBlocks();

      expect(result).toBeUndefined();
    });

    it('returns undefined when rangeCount is 0', () => {
      (mockSelection as any).rangeCount = 0;

      const result = getSelectedDomBlocks();

      expect(result).toBeUndefined();
      expect(mockSelection.getRangeAt).not.toHaveBeenCalled();
    });

    it('handle negative rangeCount', () => {
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
    it('handle plite blocks with different node types', () => {
      const mockFragment = document.createDocumentFragment();

      const textNode = document.createElement('span');
      textNode.dataset.pliteNode = 'text';
      textNode.dataset.pliteId = 'text-1';

      const elementNode = document.createElement('div');
      elementNode.dataset.pliteNode = 'element';
      elementNode.dataset.pliteId = 'element-1';

      mockFragment.append(textNode);
      mockFragment.append(elementNode);

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      // Should only return elements with data-plite-node="element"
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result?.[0]).toBe(elementNode);
    });

    it('handle getRangeAt throwing an error', () => {
      mockSelection.getRangeAt = mock(() => {
        throw new Error('Index out of bounds');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomBlocks()).toThrow('Index out of bounds');
    });

    it('handle cloneContents throwing an error', () => {
      mockRange.cloneContents = mock(() => {
        throw new Error('Failed to clone');
      });

      // The function doesn't catch the error, so it will throw
      expect(() => getSelectedDomBlocks()).toThrow('Failed to clone');
    });

    it('handle complex DOM structures', () => {
      const mockFragment = document.createDocumentFragment();

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div data-plite-node="element" data-plite-id="1">
          <p>Content</p>
          <div data-plite-node="element" data-plite-id="2">
            <span>Nested</span>
          </div>
        </div>
        <div data-plite-node="element" data-plite-id="3">
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
      expect((result?.[0] as HTMLElement).dataset.pliteId).toBe('1');
      expect((result?.[1] as HTMLElement).dataset.pliteId).toBe('2');
      expect((result?.[2] as HTMLElement).dataset.pliteId).toBe('3');
    });

    it('preserve order of blocks', () => {
      const mockFragment = document.createDocumentFragment();

      for (let i = 1; i <= 5; i++) {
        const block = document.createElement('div');
        block.dataset.pliteNode = 'element';
        block.dataset.pliteId = `block-${i}`;
        mockFragment.append(block);
      }

      mockRange.cloneContents = mock(() => mockFragment);

      const result = getSelectedDomBlocks();

      expect(result).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect((result?.[i] as HTMLElement).dataset.pliteId).toBe(
          `block-${i + 1}`
        );
      }
    });
  });
});
