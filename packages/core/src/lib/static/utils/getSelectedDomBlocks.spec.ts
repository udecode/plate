import { getSelectedDomBlocks, getSelectedDomNode } from './getSelectedDomBlocks';

describe('getSelectedDomBlocks', () => {
  let originalGetSelection: () => Selection | null;
  let mockSelection: Partial<Selection>;
  let mockRange: Partial<Range>;

  beforeEach(() => {
    originalGetSelection = window.getSelection;
    
    // Create a mock range with cloneContents
    mockRange = {
      cloneContents: jest.fn(),
    };
    
    // Create a mock selection
    mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
    };
    
    // Override window.getSelection
    window.getSelection = jest.fn().mockReturnValue(mockSelection as Selection);
  });

  afterEach(() => {
    window.getSelection = originalGetSelection;
  });

  describe('getSelectedDomBlocks', () => {
    it('should return undefined when no selection', () => {
      window.getSelection = jest.fn().mockReturnValue(null);
      const result = getSelectedDomBlocks();
      expect(result).toBeUndefined();
    });

    it('should return undefined when rangeCount is 0', () => {
      (mockSelection as any).rangeCount = 0;
      const result = getSelectedDomBlocks();
      expect(result).toBeUndefined();
    });

    it('should return array of elements with data-slate-node="element" and data-slate-id', () => {
      const fragment = document.createDocumentFragment();
      const div1 = document.createElement('div');
      div1.setAttribute('data-slate-node', 'element');
      div1.setAttribute('data-slate-id', '1');
      
      const div2 = document.createElement('div');
      div2.setAttribute('data-slate-node', 'element');
      div2.setAttribute('data-slate-id', '2');
      
      const div3 = document.createElement('div');
      div3.setAttribute('data-slate-node', 'text');
      div3.setAttribute('data-slate-id', '3');
      
      const div4 = document.createElement('div');
      div4.setAttribute('data-slate-node', 'element');
      // No data-slate-id
      
      fragment.appendChild(div1);
      fragment.appendChild(div2);
      fragment.appendChild(div3);
      fragment.appendChild(div4);
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomBlocks();
      
      expect(result).toHaveLength(2);
      expect(result![0]).toBe(div1);
      expect(result![1]).toBe(div2);
    });

    it('should return empty array when no matching elements', () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      fragment.appendChild(div);
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomBlocks();
      
      expect(result).toEqual([]);
    });

    it('should handle nested elements correctly', () => {
      const fragment = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.setAttribute('data-slate-node', 'element');
      parent.setAttribute('data-slate-id', 'parent');
      
      const child = document.createElement('div');
      child.setAttribute('data-slate-node', 'element');
      child.setAttribute('data-slate-id', 'child');
      
      parent.appendChild(child);
      fragment.appendChild(parent);
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomBlocks();
      
      expect(result).toHaveLength(2);
      expect(result![0]).toBe(parent);
      expect(result![1]).toBe(child);
    });
  });

  describe('getSelectedDomNode', () => {
    it('should return undefined when no selection', () => {
      window.getSelection = jest.fn().mockReturnValue(null);
      const result = getSelectedDomNode();
      expect(result).toBeUndefined();
    });

    it('should return undefined when rangeCount is 0', () => {
      (mockSelection as any).rangeCount = 0;
      const result = getSelectedDomNode();
      expect(result).toBeUndefined();
    });

    it('should return a div containing the cloned contents', () => {
      const fragment = document.createDocumentFragment();
      const span = document.createElement('span');
      span.textContent = 'Selected text';
      fragment.appendChild(span);
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomNode();
      
      expect(result).toBeDefined();
      expect(result!.tagName).toBe('DIV');
      expect(result!.innerHTML).toBe('<span>Selected text</span>');
    });

    it('should handle empty selection', () => {
      const fragment = document.createDocumentFragment();
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomNode();
      
      expect(result).toBeDefined();
      expect(result!.tagName).toBe('DIV');
      expect(result!.innerHTML).toBe('');
    });

    it('should preserve complex HTML structure', () => {
      const fragment = document.createDocumentFragment();
      const div = document.createElement('div');
      div.innerHTML = '<p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul>';
      
      // Move children to fragment
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      
      (mockRange.cloneContents as jest.Mock).mockReturnValue(fragment);
      
      const result = getSelectedDomNode();
      
      expect(result).toBeDefined();
      expect(result!.innerHTML).toBe('<p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul>');
    });
  });
});