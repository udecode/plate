/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { useParagraphPlugin } from '../../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { useBoldPlugin } from '../../../../../slate-plugins/src/marks/bold/useBoldPlugin';
import { useItalicPlugin } from '../../../../../slate-plugins/src/marks/italic/useItalicPlugin';
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
