/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { htmlElementToElement } from './htmlElementToElement';
import { parseHtmlElement } from './parseHtmlElement';

jsx;

const output = (
  <hp>
    <htext>test</htext>
  </hp>
);

describe('when deserializing p > test', () => {
  it('should be', () => {
    expect(
      htmlElementToElement(
        createPlateEditor({
          plugins: [ParagraphPlugin],
        }),
        parseHtmlElement(`<p>test</p>`)
      )
    ).toEqual(output);
  });
});
