/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createBaseEditor } from '../../../editor';
import { BaseParagraphPlugin } from '../../paragraph';
import { htmlElementToElement } from './htmlElementToElement';
import { parseHtmlElement } from './parseHtmlElement';

jsxt;

const output = (
  <hp>
    <htext>test</htext>
  </hp>
);

describe('when deserializing p > test', () => {
  it('returns a paragraph element', () => {
    expect(
      htmlElementToElement(
        createBaseEditor({
          plugins: [BaseParagraphPlugin],
        }),
        parseHtmlElement('<p>test</p>')
      )
    ).toEqual(output);
  });
});
