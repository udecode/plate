import { getPlainText } from './getPlainText';

describe('getPlainText', () => {
  const originalGetComputedStyle = globalThis.getComputedStyle;

  beforeEach(() => {
    globalThis.getComputedStyle = mock((element: Element) => {
      const display =
        element.tagName === 'P'
          ? 'block'
          : element.tagName === 'UL'
            ? 'list'
            : '';

      return {
        getPropertyValue: (name: string) => (name === 'display' ? display : ''),
      } as CSSStyleDeclaration;
    }) as any;
  });

  afterEach(() => {
    globalThis.getComputedStyle = originalGetComputedStyle;
  });

  it('returns text node values directly', () => {
    const textNode = document.createTextNode('hello');

    expect(getPlainText(textNode as any)).toBe('hello');
  });

  it('collects nested text and appends newlines for block, list, and br nodes', () => {
    const root = document.createElement('div');
    const paragraph = document.createElement('p');
    const lineBreak = document.createElement('br');
    const list = document.createElement('ul');
    const listItem = document.createElement('li');

    paragraph.append('Hello', lineBreak, 'World');
    listItem.append('Item');
    list.append(listItem);
    root.append(paragraph, list);

    expect(getPlainText(root as any)).toBe('Hello\nWorld\nItem\n');
  });
});
