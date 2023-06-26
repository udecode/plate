/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'char_styles';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp>
          <htext italic>This is all in an </htext>
          <htext italic bold>
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
  });
});
