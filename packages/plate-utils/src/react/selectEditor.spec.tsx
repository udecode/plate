/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { selectEditor } from './selectEditor';

jsxt;

describe('selectEditor', () => {
  describe('when edge is end', () => {});

  it('should set the cursor at the end', () => {
    const input = (
      <editor>
        <hp>
          hello
          <cursor />
        </hp>
        <element>
          <hp>world</hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>hello</hp>
        <element>
          <hp>
            world
            <cursor />
          </hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    selectEditor(input, {
      edge: 'end',
    });

    expect(input.selection).toEqual(output.selection);
  });

  describe('when edge is start', () => {});

  it('should set the cursor at the start', () => {
    const input = (
      <editor>
        <hp>
          hello
          <cursor />
        </hp>
        <element>
          <hp>world</hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
          hello
        </hp>
        <element>
          <hp>world</hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    selectEditor(input, {
      edge: 'start',
    });

    expect(input.selection).toEqual(output.selection);
  });

  describe('when at is defined', () => {});

  it('should set the cursor at', () => {
    const input = (
      <editor>
        <hp>
          hello
          <cursor />
        </hp>
        <element>
          <hp>world</hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          h<cursor />
          ello
        </hp>
        <element>
          <hp>world</hp>
        </element>
      </editor>
    ) as any as SlateEditor;

    selectEditor(input, {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    expect(input.selection).toEqual(output.selection);
  });
});
