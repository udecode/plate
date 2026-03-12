import { copyBlockMarksToSpanChild } from './copyBlockMarksToSpanChild';

describe('copyBlockMarksToSpanChild', () => {
  it('wraps block contents in a span and copies block mark styles', () => {
    const root = document.createElement('div');

    root.innerHTML =
      '<p style="font-style: italic; font-weight: 700; text-decoration: underline;">Hello</p>';

    copyBlockMarksToSpanChild(root);

    const span = root.querySelector('p > span') as HTMLSpanElement | null;

    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('Hello');
    expect(span?.style.fontStyle).toBe('italic');
    expect(span?.style.fontWeight).toBe('700');
    expect(span?.style.textDecoration).toContain('underline');
  });

  it('ignores tables and elements without inline styles', () => {
    const root = document.createElement('div');

    root.innerHTML = [
      '<table style="color: red"><tbody><tr><td>Table</td></tr></tbody></table>',
      '<p>Plain</p>',
    ].join('');

    copyBlockMarksToSpanChild(root);

    expect(root.querySelector('table > span')).toBeNull();
    expect(root.querySelector('p > span')).toBeNull();
  });
});
