/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { createSlatePlugin } from '../../../plugin/createSlatePlugin';
import { liftBlock } from './liftBlock';

jsxt;

const BlockquotePlugin = createSlatePlugin({
  key: 'blockquote',
  node: { isElement: true, type: 'blockquote' },
});

describe('liftBlock', () => {
  it('lifts a block out of a top-level matching ancestor', () => {
    const input = (
      <editor>
        <element type="blockquote">
          <hp>
            <cursor />
            Quote
          </hp>
        </element>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <cursor />
          Quote
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BlockquotePlugin],
      selection: input.selection,
      value: input.children,
    });

    const result = liftBlock(editor, { match: { type: 'blockquote' } });

    expect(result).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('lifts only one matching ancestor level', () => {
    const input = (
      <editor>
        <element type="blockquote">
          <element type="blockquote">
            <hp>
              <cursor />
              Quote
            </hp>
          </element>
        </element>
      </editor>
    ) as any;

    const output = (
      <editor>
        <element type="blockquote">
          <hp>
            <cursor />
            Quote
          </hp>
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BlockquotePlugin],
      selection: input.selection,
      value: input.children,
    });

    const result = liftBlock(editor, { match: { type: 'blockquote' } });

    expect(result).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('splits matching siblings around the lifted block', () => {
    const input = (
      <editor>
        <element type="blockquote">
          <hp>
            <cursor />
            Lead
          </hp>
          <hp>Tail</hp>
        </element>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <cursor />
          Lead
        </hp>
        <element type="blockquote">
          <hp>Tail</hp>
        </element>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BlockquotePlugin],
      selection: input.selection,
      value: input.children,
    });

    const result = liftBlock(editor, { match: { type: 'blockquote' } });

    expect(result).toBe(true);
    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('returns early when there is no matching ancestor', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
          Plain
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BlockquotePlugin],
      selection: input.selection,
      value: input.children,
    });

    const result = liftBlock(editor, { match: { type: 'blockquote' } });

    expect(result).toBeUndefined();
    expect(editor.children).toEqual(input.children);
    expect(editor.selection).toEqual(input.selection);
  });
});
