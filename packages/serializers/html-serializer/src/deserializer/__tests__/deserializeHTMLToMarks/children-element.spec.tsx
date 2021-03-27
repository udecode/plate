/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { getParagraphPlugin } from '../../../../../../elements/paragraph/src/getParagraphPlugin';
import { getBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/getBoldPlugin';
import { getItalicPlugin } from '../../../../../../marks/basic-marks/src/italic/getItalicPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

jsx;

const input = {
  plugins: [getParagraphPlugin(), getBoldPlugin(), getItalicPlugin()],
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
