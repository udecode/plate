/** @jsx jsx */

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  FontWeightPlugin,
} from '@udecode/plate-font/react';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'font';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh1>
          <htext
            color="rgb(52, 90, 138)"
            fontFamily="'Calibri',sans-serif"
            fontSize="18pt"
          >
            H1 + 18 pt
          </htext>
        </hh1>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Normal with{' '}
          </htext>
          <htext
            backgroundColor="yellow"
            fontFamily="'Cambria',serif"
            fontSize="12.0pt"
          >
            background{' '}
          </htext>
          <htext
            backgroundColor="yellow"
            color="red"
            fontFamily="'Cambria',serif"
            fontSize="12.0pt"
          >
            color
          </htext>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            .
          </htext>
        </hp>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="18pt">
            Normal + 18 pt and{' '}
          </htext>
          <htext fontFamily="'Times New Roman', serif" fontSize="10pt">
            10 pt
          </htext>
          <htext fontFamily="'Cambria',serif" fontSize="18pt">
            .
          </htext>
        </hp>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Compact
          </htext>
        </hp>
        <hp>
          <htext
            bold
            fontFamily="'Cambria', serif"
            fontSize="12.0pt"
            fontWeight="bold"
          >
            Definition Term
          </htext>
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [
      FontBackgroundColorPlugin,
      FontFamilyPlugin,
      FontColorPlugin,
      FontSizePlugin,
      FontWeightPlugin,
    ],
  });
});
