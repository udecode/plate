/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { htmlElementToElement } from './htmlElementToElement';

jsx;

const input = {
  element: document.createElement('p'),
  children: [{ text: 'test' }],
};

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
        input
      )
    ).toEqual(output);
  });
});
