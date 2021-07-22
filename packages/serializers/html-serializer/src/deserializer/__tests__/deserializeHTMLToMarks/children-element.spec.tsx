/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createItalicPlugin } from '../../../../../../marks/basic-marks/src/italic/createItalicPlugin';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

jsx;

const input = {
  plugins: [createParagraphPlugin(), createBoldPlugin(), createItalicPlugin()],
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
  expect(deserializeHTMLToMarks(createEditorPlugins(), input as any)).toEqual(
    output
  );
});
