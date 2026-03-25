/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import { queryEditor } from './queryEditor';

jsxt;

describe('queryEditor', () => {
  it('matches allowed types at the current selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    expect(queryEditor(editor, { allow: 'p' })).toBe(true);
    expect(queryEditor(editor, { allow: 'blockquote' })).toBe(false);
  });

  it('rejects excluded types and failing filters', () => {
    const editor = createEditor(
      (
        <editor>
          <hblockquote>
            test
            <cursor />
          </hblockquote>
        </editor>
      ) as any
    );

    expect(queryEditor(editor, { exclude: 'blockquote' })).toBe(false);
    expect(queryEditor(editor, { filter: () => false })).toBe(false);
  });

  it('checks selectionAtBlockStart and selectionAtBlockEnd', () => {
    const startEditor = createEditor({
      children: [{ children: [{ text: 'test' }], type: 'p' }] as any,
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });
    const endEditor = createEditor({
      children: [{ children: [{ text: 'test' }], type: 'p' }] as any,
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    expect(queryEditor(startEditor, { selectionAtBlockStart: true })).toBe(
      true
    );
    expect(queryEditor(startEditor, { selectionAtBlockEnd: true })).toBe(false);
    expect(queryEditor(endEditor, { selectionAtBlockStart: true })).toBe(false);
    expect(queryEditor(endEditor, { selectionAtBlockEnd: true })).toBe(true);
  });

  it('uses the explicit location instead of the current selection', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'test' }], type: 'p' },
        { children: [{ text: 'quote' }], type: 'blockquote' },
      ] as any,
      selection: {
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });

    expect(queryEditor(editor, { allow: 'blockquote', at: [1] })).toBe(true);
    expect(queryEditor(editor, { exclude: 'blockquote', at: [1] })).toBe(false);
  });
});
