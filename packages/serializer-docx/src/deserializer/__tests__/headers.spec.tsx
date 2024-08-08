/** @jsx jsx */

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  FontWeightPlugin,
} from '@udecode/plate-font';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'headers';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
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
            color="rgb(79, 129, 189)"
            fontFamily="'Calibri',sans-serif"
            fontSize="12.0pt"
            italic
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
    filename: name,
    plugins: [
      FontBackgroundColorPlugin,
      FontColorPlugin,
      FontSizePlugin,
      FontFamilyPlugin,
      FontWeightPlugin,
    ],
  });
});
