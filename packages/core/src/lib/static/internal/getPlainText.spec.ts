import { getPlainText } from './getPlainText';

describe('getPlainText', () => {
  // Mock getComputedStyle
  const mockGetComputedStyle = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    global.getComputedStyle = mockGetComputedStyle as any;
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: jest.fn((prop: string) => {
        if (prop === 'display') return 'inline';
        return '';
      }),
    });
  });

  describe('text nodes', () => {
    it('should return text content of a text node', () => {
      const textNode = document.createTextNode('Hello world');
      
      const result = getPlainText(textNode);
      
      expect(result).toBe('Hello world');
    });

    it('should return empty string for empty text node', () => {
      const textNode = document.createTextNode('');
      
      const result = getPlainText(textNode);
      
      expect(result).toBe('');
    });
  });

  describe('element nodes', () => {
    it('should return text content of simple element', () => {
      const div = document.createElement('div');
      div.textContent = 'Simple text';
      
      const result = getPlainText(div);
      
      expect(result).toBe('Simple text');
    });

    it('should concatenate text from multiple child nodes', () => {
      const div = document.createElement('div');
      div.innerHTML = 'Hello <span>world</span>!';
      
      const result = getPlainText(div);
      
      expect(result).toBe('Hello world!');
    });

    it('should add newline for block elements', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'block';
          return '';
        }),
      });

      const div = document.createElement('div');
      div.textContent = 'Block text';
      
      const result = getPlainText(div);
      
      expect(result).toBe('Block text\n');
    });

    it('should add newline for list elements', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'list';
          return '';
        }),
      });

      const li = document.createElement('li');
      li.textContent = 'List item';
      
      const result = getPlainText(li);
      
      expect(result).toBe('List item\n');
    });

    it('should add newline for BR elements', () => {
      const br = document.createElement('br');
      
      const result = getPlainText(br);
      
      expect(result).toBe('\n');
    });

    it('should handle nested block elements', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'block';
          return '';
        }),
      });

      const container = document.createElement('div');
      container.innerHTML = '<p>Paragraph 1</p><p>Paragraph 2</p>';
      
      const result = getPlainText(container);
      
      expect(result).toBe('Paragraph 1\nParagraph 2\n\n');
    });

    it('should handle mixed inline and block elements', () => {
      let callCount = 0;
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') {
            // Alternate between block and inline
            callCount++;
            return callCount % 2 === 0 ? 'block' : 'inline';
          }
          return '';
        }),
      });

      const container = document.createElement('div');
      container.innerHTML = 'Text with <span>inline</span> and <div>block</div> elements';
      
      const result = getPlainText(container);
      
      // The exact result depends on which elements get which display value
      expect(result).toContain('Text with inline and block');
      expect(result).toContain('\n');
    });
  });

  describe('complex HTML structures', () => {
    it('should handle deeply nested elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div><p><span><strong>Deeply</strong> <em>nested</em></span> text</p></div>';
      
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'inline';
          return '';
        }),
      });
      
      const result = getPlainText(container);
      
      expect(result).toBe('Deeply nested text');
    });

    it('should handle empty elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p></p><div></div><span></span>';
      
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'block';
          return '';
        }),
      });
      
      const result = getPlainText(container);
      
      // The container div is block so adds a newline at the end
      expect(result).toBe('\n\n\n\n');
    });

    it('should handle mixed content with BR tags', () => {
      const container = document.createElement('div');
      container.innerHTML = 'Line 1<br/>Line 2<br/>Line 3';
      
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'inline';
          return '';
        }),
      });
      
      const result = getPlainText(container);
      
      expect(result).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('edge cases', () => {
    it('should handle comment nodes', () => {
      const container = document.createElement('div');
      const comment = document.createComment('This is a comment');
      container.appendChild(comment);
      container.appendChild(document.createTextNode('Text'));
      
      const result = getPlainText(container);
      
      expect(result).toBe('Text');
    });

    it('should handle document fragments', () => {
      const fragment = document.createDocumentFragment();
      const p1 = document.createElement('p');
      p1.textContent = 'Paragraph 1';
      const p2 = document.createElement('p');
      p2.textContent = 'Paragraph 2';
      fragment.appendChild(p1);
      fragment.appendChild(p2);
      
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn((prop: string) => {
          if (prop === 'display') return 'block';
          return '';
        }),
      });
      
      const result = getPlainText(fragment as any);
      
      // Document fragments are not DOM elements and might not be processed
      expect(result).toBe('');
    });
  });
});