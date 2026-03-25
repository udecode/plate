import { traverseHtmlNode } from './traverseHtmlNode';

describe('traverseHtmlNode', () => {
  it('stops traversing a branch when the callback returns false', () => {
    const root = document.createElement('div');

    root.innerHTML = '<span><b>skip</b></span><p>keep</p>';

    const visited: string[] = [];

    traverseHtmlNode(root, (node) => {
      visited.push(node.nodeName);

      return node.nodeName !== 'SPAN';
    });

    expect(visited).toContain('SPAN');
    expect(visited).toContain('P');
    expect(visited).not.toContain('B');
  });

  it('recomputes the next child when the first child rewrites the sibling list', () => {
    const root = document.createElement('div');
    const first = document.createElement('p');
    const second = document.createElement('p');
    const third = document.createElement('p');
    const visited: string[] = [];

    first.textContent = '1';
    second.textContent = '2';
    third.textContent = '3';
    root.append(first, second, third);

    traverseHtmlNode(root, (node) => {
      if (node instanceof Element && node.tagName === 'P') {
        visited.push(node.textContent || '');
      }

      if (node === first) {
        const list = document.createElement('ul');
        const item = document.createElement('li');

        item.textContent = 'merged';
        list.append(item);
        second.remove();
        root.insertBefore(list, third);
        first.remove();
      }

      return true;
    });

    expect(visited).toEqual(['1', '3']);
  });
});
