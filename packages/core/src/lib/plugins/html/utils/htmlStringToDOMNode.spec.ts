import { htmlStringToDOMNode } from './htmlStringToDOMNode';

describe('htmlStringToDOMNode', () => {
  it('parses HTML in an inert document', () => {
    const node = htmlStringToDOMNode('<p>content</p>');

    expect(node.ownerDocument).not.toBe(document);
    expect(node.innerHTML).toBe('<p>content</p>');
  });
});
