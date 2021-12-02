/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'tabs';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp>Some text separated{`\t`}by a tab.</hp>
        <hp>{`\t`}Tab-indented text.</hp>
      </editor>
    ),
  });
});
