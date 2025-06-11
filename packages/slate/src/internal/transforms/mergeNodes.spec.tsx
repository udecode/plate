/** @jsx jsxt */

import { createSlateEditor, createSlatePlugin } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';

jsxt;

describe('select void on backspace behavior', () => {
  it('should select void block and remove empty current block when at start', () => {
    const input = (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="img">
          <cursor />
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'img',
          node: {
            isElement: true,
            isVoid: true,
            type: 'img',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should select void block without removing non-empty current block when at start', () => {
    const input = (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          <cursor />
          some content
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="img">
          <cursor />
        </element>
        <hp>some content</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'img',
          node: {
            isElement: true,
            isVoid: true,
            type: 'img',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should NOT select when previous block is not void', () => {
    const input = (
      <editor>
        <hp>previous content</hp>
        <hp>
          <cursor />
          current content
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          previous content
          <cursor />
          current content
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should NOT select when not at start of block', () => {
    const input = (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          some
          <cursor />
          content
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="img">
          <htext />
        </element>
        <hp>
          som
          <cursor />
          content
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'img',
          node: {
            isElement: true,
            isVoid: true,
            type: 'img',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should work with horizontal rule void block', () => {
    const input = (
      <editor>
        <element type="hr">
          <htext />
        </element>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should work with horizontal rule void block (reverse)', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
        <element type="hr">
          <htext />
        </element>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteForward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('should work with text + horizontal rule void block (reverse)', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
        <element type="hr">
          <htext />
        </element>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>text</hp>
        <element type="hr">
          <cursor />
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteForward('character');

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });
});
