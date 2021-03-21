/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { useParagraphPlugin } from '../../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { deserializeHTMLToElement } from '../../utils/deserializeHTMLToElement';

const input = {
  plugins: [useParagraphPlugin()],
  element: document.createElement('p'),
  children: [{ text: 'test' }],
};

const output = (
  <hp>
    <htext>test</htext>
  </hp>
);

it('should be', () => {
  expect(deserializeHTMLToElement(createEditorPlugins(), input)).toEqual(
    output
  );
});
