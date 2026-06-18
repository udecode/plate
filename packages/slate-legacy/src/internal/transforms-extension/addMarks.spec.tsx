/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('addMarks', () => {
  it('updates editor.marks at a collapsed selection and removes conflicting marks', () => {
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

    editor.marks = { italic: true, underline: true };

    editor.tf.addMarks({ bold: true, color: 'red' } as any, {
      remove: ['italic', 'underline'],
    });

    expect(editor.marks).toEqual({ bold: true, color: 'red' });
  });

  it('replaces marks across an expanded selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <anchor />
            <htext italic underline>
              st
            </htext>
            <focus />
            ing
          </hp>
        </editor>
      ) as any
    );

    editor.tf.addMarks({ bold: true } as any, {
      remove: ['italic', 'underline'],
    });

    expect(editor.children).toEqual([
      {
        children: [{ text: 'te' }, { bold: true, text: 'st' }, { text: 'ing' }],
        type: 'p',
      },
    ]);
  });

  it('does nothing without a selection', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'test' }], type: 'p' }] as any,
    });

    editor.marks = { italic: true };
    editor.tf.addMarks({ bold: true } as any);

    expect(editor.children).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
    ]);
    expect(editor.marks).toEqual({ italic: true });
  });
});
