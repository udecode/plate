/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { deserializeHtml } from './deserializeHtml';

jsxt;

describe('deserializeHtml', () => {
  it('wraps inline-only html in the default block', () => {
    const editor = createSlateEditor();

    expect(deserializeHtml(editor, { element: 'first<br><br>second' })).toEqual(
      [
        <hp>
          <htext>{'first\n\nsecond'}</htext>
        </hp>,
      ]
    );
  });

  it('wraps empty html in the default block', () => {
    const editor = createSlateEditor();

    expect(deserializeHtml(editor, { element: '' })).toEqual([
      <hp>
        <htext />
      </hp>,
    ]);
  });
});
