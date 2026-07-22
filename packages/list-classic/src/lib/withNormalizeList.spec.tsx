/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import {
  jsxt,
  type TestEditor,
  type TestEditorFixture,
} from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const testNormalize = (
  input: TestEditorFixture,
  output: TestEditorFixture
): void => {
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  editor.update.value.repair();

  expect(editor.read.children()).toEqual(output.children);
};

describe('merge lists', () => {
  it('does not merge lists with different type', () => {
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
    ) as TestEditor;

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
    ) as TestEditor;

    testNormalize(input, output);
  });

  it('merge the next list if it has the same type', () => {
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
    ) as TestEditor;

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
    ) as TestEditor;

    testNormalize(input, output);
  });

  it('merge the previous list if it has the same type', () => {
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
    ) as TestEditor;

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
    ) as TestEditor;

    testNormalize(input, output);
  });
});
