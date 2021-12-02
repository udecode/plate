/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'dummy_item_after_paragraph';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp indent={1} lineHeight="115%">
          First bullet point created and then deleted
        </hp>
        <hp lineHeight="115%">A normal paragraph</hp>
        <hp indent={1} lineHeight="115%">
          First bullet point created and then deleted after the normal paragraph
        </hp>
      </editor>
    ),
  });
});
