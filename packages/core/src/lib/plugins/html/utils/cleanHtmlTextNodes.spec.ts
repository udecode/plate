import { NO_BREAK_SPACE } from '../constants';
import { cleanHtmlTextNodes } from './cleanHtmlTextNodes';

describe('cleanHtmlTextNodes', () => {
  it('removes whitespace-only newline nodes between sibling elements', () => {
    const root = document.createElement('div');

    root.innerHTML = '<span>one</span>\n   <span>two</span>';

    cleanHtmlTextNodes(root);

    expect(root.childNodes).toHaveLength(2);
    expect(root.textContent).toBe('onetwo');
  });

  it('converts a lone non-breaking space into a regular space', () => {
    const root = document.createElement('div');

    root.append(document.createTextNode(NO_BREAK_SPACE));

    cleanHtmlTextNodes(root);

    expect(root.textContent).toBe(' ');
  });

  it('removes a leading br and normalizes newline text into a single leading newline', () => {
    const root = document.createElement('div');

    root.innerHTML = '<div><br>\n\rHello</div>';

    cleanHtmlTextNodes(root);

    const textNode = root.firstChild?.firstChild as Text | null;

    expect(root.querySelector('br')).toBeNull();
    expect(textNode?.data).toBe('\nHello');
  });
});
