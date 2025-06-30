import { getPlainText } from './getPlainText';

describe('getPlainText', () => {
  // Mock getComputedStyle to return display values
  beforeEach(() => {
    (global as any).getComputedStyle = jest.fn((element: HTMLElement) => ({
      getPropertyValue: (prop: string) => {
        if (prop === 'display') {
          // Return display values based on tag name
          const tagName = element.tagName?.toLowerCase();
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            return 'block';
          }
          if (tagName === 'li') {
            return 'list-item';
          }
          return 'inline';
        }
        return '';
      },
    }));
  });
  it('should extract plain text from a text node', () => {
    const textNode = document.createTextNode('Hello World');
    const result = getPlainText(textNode);
    expect(result).toBe('Hello World');
  });

  it('should handle empty text nodes', () => {
    const textNode = document.createTextNode('');
    const result = getPlainText(textNode);
    expect(result).toBe('');
  });

  it('should extract text from nested elements', () => {
    const div = document.createElement('div');
    div.innerHTML = '<span>Hello</span> <strong>World</strong>';
    const result = getPlainText(div);
    expect(result).toBe('Hello World\n');
  });

  it('should add newlines for block elements', () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>First paragraph</p><p>Second paragraph</p>';
    const result = getPlainText(div);
    expect(result).toBe('First paragraph\nSecond paragraph\n\n');
  });

  it('should add newlines for BR tags', () => {
    const div = document.createElement('div');
    div.innerHTML = 'Line 1<br>Line 2';
    const result = getPlainText(div);
    expect(result).toBe('Line 1\nLine 2');
  });

  it('should handle nested block elements', () => {
    const div = document.createElement('div');
    div.innerHTML = '<div><p>Nested</p></div>';
    const result = getPlainText(div);
    expect(result).toBe('Nested\n\n');
  });

  it('should handle list elements', () => {
    const ul = document.createElement('ul');
    ul.innerHTML = '<li>Item 1</li><li>Item 2</li>';
    // Set display style to list-item for li elements
    const listItems = ul.querySelectorAll('li');
    listItems.forEach((li) => {
      Object.defineProperty(li, 'tagName', { value: 'LI' });
    });
    const result = getPlainText(ul);
    expect(result).toBe('Item 1\nItem 2\n');
  });

  it('should handle mixed content', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h1>Title</h1>
      <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    `;
    const result = getPlainText(div);
    expect(result).toContain('Title');
    expect(result).toContain('Paragraph with bold and italic text.');
    expect(result).toContain('List item 1');
    expect(result).toContain('List item 2');
  });

  it('should handle elements without text', () => {
    const div = document.createElement('div');
    div.innerHTML = '<img src="test.jpg" alt="Test"><br>';
    const result = getPlainText(div);
    expect(result).toBe('\n');
  });
});