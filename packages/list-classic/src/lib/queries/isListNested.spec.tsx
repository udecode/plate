/** @jsx jsxt */

import { createBaseEditor, NodeIdPlugin } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { isListNested } from './isListNested';

jsxt;

const SchemaOnlyNodeIdPlugin = NodeIdPlugin.configure({
  options: { initialValueIds: false, match: () => false },
});

describe('when the list is nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hlic>2</hlic>
          <hul id="21">
            <hli>
              <hlic>21</hlic>
            </hli>
            <hli>
              <hlic>
                22
                <cursor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('returns true', () => {
    const editor = createBaseEditor({
      plugins: [SchemaOnlyNodeIdPlugin, BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    const list = editor.read.nodes.find({ match: { id: '21' } });

    expect(isListNested(editor, list?.[1] as any)).toBeTruthy();
  });
});

describe('when the list is not nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hlic>2</hlic>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('returns false', () => {
    const editor = createBaseEditor({
      plugins: [SchemaOnlyNodeIdPlugin, BaseListPlugin],
      selection: input.selection,
      value: input.children,
    });

    const list = editor.read.nodes.find({ match: { id: '1' } });

    expect(isListNested(editor, list?.[1] as any)).toBeFalsy();
  });
});
