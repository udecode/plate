/** @jsx jsxt */

import {
  type SlateEditor,
  createSlateEditor,
  normalizeEditor,
} from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { ListPlugin } from '../react';

jsxt;

const testNormalize = (input: SlateEditor, output: SlateEditor): void => {
  const editor = createSlateEditor({
    editor: input,
    plugins: [ListPlugin],
  });

  normalizeEditor(editor, { force: true });

  expect(input.children).toEqual(output.children);
};

describe('merge lists', () => {
  it('should not merge lists with different type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hol>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hol>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hol>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('should merge the next list if it has the same type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('should merge the previous list if it has the same type', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>1</hlic>
          </hli>
          <hli>
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });
});

describe('clean up lists', () => {
  it('should remove list without list items', () => {
    const input = (
      <editor>
        <hul />
      </editor>
    ) as any as SlateEditor;

    const output = (<editor />) as any as SlateEditor;

    testNormalize(input, output);
  });

  it('should only allow li to be child of ul', () => {
    const input = (
      <editor>
        <hul>
          <hp>bad</hp>
          <hli>
            <hlic>ok</hlic>
          </hli>
          <hp>bad</hp>
        </hul>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>bad</hlic>
          </hli>
          <hli>
            <hlic>ok</hlic>
          </hli>
          <hli>
            <hlic>bad</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as SlateEditor;

    testNormalize(input, output);
  });
});
