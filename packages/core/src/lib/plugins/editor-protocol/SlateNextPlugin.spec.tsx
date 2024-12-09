/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createPlateEditor } from '../../../react';

jsxt;

// https://github.com/udecode/editor-protocol/issues/81
describe('delete marked text at block start', () => {
  it('delete backward in a marked text at offset 1, it should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            a<cursor />
            bc
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          a<htext bold>bc</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.deleteBackward('character');
    editor.insertText('a');

    expect(editor.children).toEqual(output.children);
  });

  it('when delete forward at start of a marked block, it should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            <cursor />
            abc
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          a<htext bold>bc</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.deleteForward('character');
    editor.insertText('a');

    expect(editor.children).toEqual(output.children);
  });

  it('when delete fragment with anchor or focus at start of a marked block, should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            <anchor />b<focus />c
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          b<cursor />
          <htext bold>c</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.deleteBackward('character');
    editor.insertText('b');

    expect(editor.children).toEqual(output.children);
  });
});

describe('editor.tf.setValue', () => {
  it('should set the editor value correctly', () => {
    const input = (
      <editor>
        <hp>existing content</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>new content</hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.tf.setValue('<p>new content</p>');

    expect(editor.children).toEqual(output.children);
  });

  it('should set empty value when no argument is provided', () => {
    const input = (
      <editor>
        <hp>existing content</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      editor: input,
    });

    editor.tf.setValue();

    expect(editor.children).toEqual(output.children);
  });
});
