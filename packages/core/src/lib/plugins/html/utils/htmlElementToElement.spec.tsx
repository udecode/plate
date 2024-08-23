/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import { ParagraphPlugin } from '../../../../react';
import { createPlateEditor } from '../../../../react/editor/withPlate';
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
