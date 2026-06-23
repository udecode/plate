import { describe, expect, it } from 'bun:test';

import { hjsx, jsx, jsxt } from './jsx';

describe('Plate test hyperscript helpers', () => {
  it('creates Plate shorthand elements through Slate v2 primitives', () => {
    expect(jsx('fragment', {}, jsx('hp', {}, 'Hello'))).toEqual([
      { children: [{ text: 'Hello' }], type: 'p' },
    ]);
  });

  it('keeps jsxt as the plain-text creator alias', () => {
    expect(
      jsxt('fragment', {}, jsxt('hp', {}, jsxt('htext', {}, 'A')))
    ).toEqual([{ children: [{ text: 'A' }], type: 'p' }]);
  });

  it('creates explicit htext nodes through the Plate factory', () => {
    expect(hjsx('htext', { bold: true }, 'B')).toEqual({
      bold: true,
      text: 'B',
    });
  });

  it('keeps editor fixtures readable through direct children', () => {
    const editor = jsx('editor', {}, jsx('hp', {}, 'A'));

    expect(editor.children).toEqual([{ children: [{ text: 'A' }], type: 'p' }]);
  });
});
