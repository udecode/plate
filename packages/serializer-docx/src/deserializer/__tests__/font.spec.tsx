/** @jsx jsx */

import { createFontBackgroundColorPlugin } from '@/packages/font/src/createFontBackgroundColorPlugin';
import { createFontColorPlugin } from '@/packages/font/src/createFontColorPlugin';
import { createFontFamilyPlugin } from '@/packages/font/src/createFontFamilyPlugin';
import { createFontSizePlugin } from '@/packages/font/src/createFontSizePlugin';
import { createFontWeightPlugin } from '@/packages/font/src/createFontWeightPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'font';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
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
          <htext fontSize="12.0pt" fontFamily="'Cambria',serif">
            Normal with{' '}
          </htext>
          <htext
            fontSize="12.0pt"
            fontFamily="'Cambria',serif"
            backgroundColor="yellow"
          >
            background{' '}
          </htext>
          <htext
            fontSize="12.0pt"
            fontFamily="'Cambria',serif"
            backgroundColor="yellow"
            color="red"
          >
            color
          </htext>
          <htext fontSize="12.0pt" fontFamily="'Cambria',serif">
            .
          </htext>
        </hp>
        <hp>
          <htext fontSize="18pt" fontFamily="'Cambria',serif">
            Normal + 18 pt and{' '}
          </htext>
          <htext fontSize="10pt" fontFamily="'Times New Roman', serif">
            10 pt
          </htext>
          <htext fontSize="18pt" fontFamily="'Cambria',serif">
            .
          </htext>
        </hp>
        <hp>
          <htext fontSize="12.0pt" fontFamily="'Cambria',serif">
            Compact
          </htext>
        </hp>
        <hp>
          <htext
            fontSize="12.0pt"
            fontFamily="'Cambria', serif"
            fontWeight="bold"
            bold
          >
            Definition Term
          </htext>
        </hp>
      </editor>
    ),
    plugins: [
      createFontBackgroundColorPlugin(),
      createFontFamilyPlugin(),
      createFontColorPlugin(),
      createFontSizePlugin(),
      createFontWeightPlugin(),
    ],
  });
});
