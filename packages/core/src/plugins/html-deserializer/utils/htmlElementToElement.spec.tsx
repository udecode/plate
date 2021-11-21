/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { parseHtmlElement } from '../../../../../serializers/docx/src/docx-cleaner/utils/parseHtmlElement';
import { htmlElementToElement } from './htmlElementToElement';

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
        createPlateUIEditor({
          plugins: [createParagraphPlugin()],
        }),
        parseHtmlElement(`<p>test</p>`)
      )
    ).toEqual(output);
  });
});
