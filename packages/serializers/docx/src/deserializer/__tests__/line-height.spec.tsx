/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'line-height';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh1 lineHeight="200%">Line-height 2.0</hh1>
        <hp lineHeight="150%">Line-height 1.5</hp>
        <hp lineHeight="150%">Line-height 1.5</hp>
      </editor>
    ),
  });
});
