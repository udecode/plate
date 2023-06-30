/** @jsx jsx */

import { PlateEditor } from '@/packages/core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

import { selectEditor } from './selectEditor';

jsx;

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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

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
    ) as any as PlateEditor;

    selectEditor(input, {
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    expect(input.selection).toEqual(output.selection);
  });
});
