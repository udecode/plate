import { describe, expect, it } from 'bun:test';
import {
  createEditor as createPliteEditor,
  createHyperscript as createPliteHyperscript,
} from '@platejs/plite-hyperscript';

import {
  createEditor,
  createEditorFromFixture,
  createHyperscript,
  hjsx,
  jsx,
  jsxt,
} from './jsx';

describe('Plate test hyperscript helpers', () => {
  it('re-exports generic factory helpers from their Plite owner', () => {
    expect(createEditor).toBe(createPliteEditor);
    expect(createHyperscript).toBe(createPliteHyperscript);
  });

  it('creates Plate shorthand elements through Plite primitives', () => {
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

  it('creates fresh text children for void shorthands', () => {
    const first = jsx('himg', {});
    const second = jsx('himg', {});

    expect(first.children).toEqual([{ text: '' }]);
    expect(second.children).toEqual([{ text: '' }]);
    expect(first.children).not.toBe(second.children);
  });

  it('rejects invalid numeric children instead of dropping them', () => {
    expect(() => jsx('hp', {}, 0)).toThrow(
      'Unexpected hyperscript child object: 0'
    );
  });

  it('preserves an explicitly empty fixture', () => {
    const editor = createEditorFromFixture(jsx('editor'));

    expect(editor.read.children()).toEqual([]);
  });
});
