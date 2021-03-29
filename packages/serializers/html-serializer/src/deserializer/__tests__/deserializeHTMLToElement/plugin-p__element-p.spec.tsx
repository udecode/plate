/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToElement } from '../../utils/deserializeHTMLToElement';

jsx;

const input = {
  plugins: [createParagraphPlugin()],
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
