/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { BaseParagraphPlugin } from '../../paragraph';
import { htmlBodyToFragment } from './htmlBodyToFragment';
import { parseHtmlElement } from './parseHtmlElement';

jsxt;

describe('when element is a body', () => {
  it('returns a fragment with the body children', () => {
    const output = (
      <fragment>
        <hp>
          <htext>test</htext>
        </hp>
      </fragment>
    );

    const body = document.createElement('body');
    body.append(parseHtmlElement('<p>test</p>'));

    expect(
      htmlBodyToFragment(
        createSlateEditor({ plugins: [BaseParagraphPlugin] }),
        body
      )
    ).toEqual(output);
  });
});

describe('when element is not a body', () => {
  const output = undefined;

  it('returns undefined', () => {
    expect(
      htmlBodyToFragment(
        createSlateEditor(),
        parseHtmlElement('<div>test</div>')
      )
    ).toEqual(output);
  });
});
