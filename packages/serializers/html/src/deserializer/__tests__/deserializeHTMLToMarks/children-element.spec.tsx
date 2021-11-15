/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createItalicPlugin } from '../../../../../../marks/basic-marks/src/italic/createItalicPlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

jsx;

const input = {
  element: document.createElement('strong'),
  children: [
    <hli>
      <hp>test</hp>test
    </hli>,
    null,
  ],
};

const output = (
  <fragment>
    <hli>
      <hp>
        <htext bold>test</htext>
      </hp>
      <htext bold>test</htext>
    </hli>
  </fragment>
);

it('should be', () => {
  expect(
    deserializeHTMLToMarks(
      createPlateUIEditor({
        plugins: [
          createParagraphPlugin(),
          createBoldPlugin(),
          createItalicPlugin(),
        ],
      }),
      input as any
    )
  ).toEqual(output);
});
