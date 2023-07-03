/** @jsx jsx */

import { createFontBackgroundColorPlugin } from '@/packages/font/src/createFontBackgroundColorPlugin';
import { createFontColorPlugin } from '@/packages/font/src/createFontColorPlugin';
import { createFontFamilyPlugin } from '@/packages/font/src/createFontFamilyPlugin';
import { createFontSizePlugin } from '@/packages/font/src/createFontSizePlugin';
import { createFontWeightPlugin } from '@/packages/font/src/createFontWeightPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'headers';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh1>
          <htext
            color="rgb(52, 90, 138)"
            fontFamily="'Calibri',sans-serif"
            fontSize="16.0pt"
          >
            A Test of Headers
          </htext>
        </hh1>
        <hh2>
          <htext
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="16.0pt"
          >
            Second Level
          </htext>
        </hh2>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Some plain text.
          </htext>
        </hp>
        <hh3>
          <htext
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="14.0pt"
          >
            Third level
          </htext>
        </hh3>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Some more plain text.
          </htext>
        </hp>
        <hh4>
          <htext
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="12.0pt"
          >
            Fourth level
          </htext>
        </hh4>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Some more plain text.
          </htext>
        </hp>
        <hh5>
          <htext
            italic
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="12.0pt"
          >
            Fifth level
          </htext>
        </hh5>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Some more plain text.
          </htext>
        </hp>
        <hh6>
          <htext
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="12.0pt"
          >
            Sixth level
          </htext>
        </hh6>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Some more plain text.
          </htext>
        </hp>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Seventh level
          </htext>
        </hp>
        <hp>
          <htext fontFamily="'Cambria',serif" fontSize="12.0pt">
            Since no Heading 7 style exists in styles.xml, this gets converted
            to Span.
          </htext>
        </hp>
      </editor>
    ),
    plugins: [
      createFontBackgroundColorPlugin(),
      createFontColorPlugin(),
      createFontSizePlugin(),
      createFontFamilyPlugin(),
      createFontWeightPlugin(),
    ],
  });
});
