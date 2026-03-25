import { cleanHtmlTextNodes } from './cleanHtmlTextNodes';

describe('cleanHtmlTextNodes', () => {
  it('removes newline-only gaps and normalizes nbsp and carriage-return dust', () => {
    const root = document.createElement('div');
    const first = document.createElement('span');
    const second = document.createElement('span');
    const nbsp = document.createElement('span');
    const carriage = document.createElement('span');

    first.textContent = 'A';
    second.textContent = 'B';
    nbsp.append(document.createTextNode('\u00A0'));
    carriage.append(document.createTextNode('\r'));

    root.append(
      first,
      document.createTextNode('\n   '),
      second,
      nbsp,
      carriage
    );

    cleanHtmlTextNodes(root);

    expect(root.childNodes).toHaveLength(4);
    expect(root.childNodes[1]).toBe(second);
    expect(nbsp.textContent).toBe(' ');
    expect(carriage.textContent).toBe('');
  });

  it('removes a preceding br and keeps a single leading newline', () => {
    const root = document.createElement('div');
    const br = document.createElement('br');
    const text = document.createTextNode('\nhello\rworld');

    root.append(br, text);

    cleanHtmlTextNodes(root);

    expect(root.querySelector('br')).toBeNull();
    expect(root.textContent).toBe('\nhello world');
  });

  it('replaces line feeds and carriage returns with spaces when there is no preceding br', () => {
    const root = document.createElement('div');
    root.append(document.createTextNode('hello\nworld\ragain'));

    cleanHtmlTextNodes(root);

    expect(root.textContent).toBe('hello world again');
  });
});
