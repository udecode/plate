/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'align';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh1 align="center">Aligned Headers</hh1>
        <hh2 align="right">Second Level</hh2>
        <hp align="justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </hp>
      </editor>
    ),
    filename: name,
  });
});
