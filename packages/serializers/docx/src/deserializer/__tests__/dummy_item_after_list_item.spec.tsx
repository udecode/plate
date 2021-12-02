/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'dummy_item_after_list_item';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp indent={1} listStyleType="decimal" lineHeight="115%">
          One
        </hp>
        <hp indent={1} lineHeight="115%">
          Two{'\n'}
          {'\n'}Three
        </hp>
      </editor>
    ),
  });
});
