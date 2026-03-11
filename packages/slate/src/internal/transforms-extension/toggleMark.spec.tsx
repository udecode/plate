/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('toggleMark', () => {
  it('does nothing without a selection', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'test' }], type: 'p' }] as any,
    });

    editor.selection = null;
    editor.marks = { bold: true };

    editor.tf.toggleMark('italic');

    expect(editor.children).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
    ]);
    expect(editor.marks).toEqual({ bold: true });
  });

  it('removes the mark when it is already active', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <cursor />
            st
          </hp>
        </editor>
      ) as any
    );

    editor.marks = { bold: true };

    editor.tf.toggleMark('bold');

    expect(editor.marks).toEqual({});
  });

  it('replaces mutually exclusive marks at a collapsed selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <cursor />
            st
          </hp>
        </editor>
      ) as any
    );

    editor.marks = { superscript: true };

    editor.tf.toggleMark('subscript', { remove: 'superscript' });

    expect(editor.marks).toEqual({ subscript: true });
  });

  it('replaces mutually exclusive marks across an expanded selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <anchor />
            <htext superscript>st</htext>
            <focus />
          </hp>
        </editor>
      ) as any
    );

    editor.tf.toggleMark('subscript', { remove: 'superscript' });

    expect(editor.children).toEqual([
      {
        children: [{ text: 'te' }, { subscript: true, text: 'st' }],
        type: 'p',
      },
    ]);
  });
});
