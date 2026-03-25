/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { wrapLink } from './wrapLink';

jsxt;

describe('wrapLink', () => {
  it('wraps the selected text and preserves surrounding content', () => {
    const input = (
      <editor>
        <hp>
          hello <anchor />
          world
          <focus />!
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: input.selection,
      value: input.children,
    });

    wrapLink(editor, {
      target: '_self',
      url: 'https://example.com',
    });

    expect(editor.children).toEqual(
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
