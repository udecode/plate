/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'char_styles';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>
          <htext italic>This is all in an </htext>
          <htext bold italic>
            italic style
          </htext>
          <htext italic>.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext italic>This is an italic </htext>style
          <htext italic> with some </htext>
          words<htext italic> unitalicized.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext bold>This is all in a </htext>
          <htext bold italic>
            strong style
          </htext>
          <htext bold>.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext bold>This is a strong </htext>style
          <htext bold> with some </htext>words<htext bold> ubolded.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
      </editor>
    ),
    filename: name,
  });
});
