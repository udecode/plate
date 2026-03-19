/** @jsx jsxt */

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  FontWeightPlugin,
} from '@platejs/basic-styles/react';
import { jsxt } from '@platejs/test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'headers';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh1>
          <htext
            color="#345A8A"
            fontFamily="Calibri, sans-serif"
            fontSize="16pt"
          >
            A Test of Headers
          </htext>
        </hh1>
        <hh2>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="16pt"
          >
            Second Level
          </htext>
        </hh2>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some plain text.
          </htext>
        </hp>
        <hh3>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="14pt"
          >
            Third level
          </htext>
        </hh3>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hh4>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
          >
            Fourth level
          </htext>
        </hh4>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hh5>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
            italic
          >
            Fifth level
          </htext>
        </hh5>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hh6>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
          >
            Sixth level
          </htext>
        </hh6>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Seventh level
          </htext>
        </hp>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
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
