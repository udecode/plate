/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'align';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
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
  });
});
