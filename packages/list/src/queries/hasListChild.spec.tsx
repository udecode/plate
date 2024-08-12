/** @jsx jsx */

import { createSlateEditor, findNode } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { hasListChild } from './hasListChild';

jsx;

describe('when there is a sublist', () => {
  const input = (
    <editor>
      <hul>
        <hli id="2">
          <hp>2</hp>
          <hul>
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>
                22
                <cursor />
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      editor: input,
    });

    const listItem = findNode(editor, { match: { id: '2' } });

    expect(hasListChild(editor, listItem?.[0] as any)).toBeTruthy();
  });
});

describe('when there is no sublist', () => {
  const input = (
    <editor>
      <hul>
        <hli id="2">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      editor: input,
    });

    const listItem = findNode(editor, { match: { id: '2' } });

    expect(hasListChild(editor, listItem?.[0] as any)).toBeFalsy();
  });
});
