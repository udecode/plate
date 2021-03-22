/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { useParagraphPlugin } from '../../../../../../elements/paragraph/src/useParagraphPlugin';
import { useBoldPlugin } from '../../../../../../marks/basic-marks/src/bold/useBoldPlugin';
import { useItalicPlugin } from '../../../../../../marks/basic-marks/src/italic/useItalicPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToMarks } from '../../utils/deserializeHTMLToMarks';

const input = {
  plugins: [useParagraphPlugin(), useBoldPlugin(), useItalicPlugin()],
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
