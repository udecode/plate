/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseLinkPlugin } from './BaseLinkPlugin';

jsxt;

describe('editor.update.link.wrap', () => {
  it('wraps selected text and preserves surrounding content', () => {
    const input = (
      <editor>
        <hp>
          hello <anchor />
          world
          <focus />!
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [BaseLinkPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.link.wrap({
      target: '_self',
      url: 'https://example.com',
    });

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hp>
            hello{' '}
            <ha target="_self" url="https://example.com">
              world
            </ha>
            !
          </hp>
        </editor>
      ).children
    );
  });
});
