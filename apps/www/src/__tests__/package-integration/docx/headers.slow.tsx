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
        <hheading level={1}>
          <htext
            color="#345A8A"
            fontFamily="Calibri, sans-serif"
            fontSize="16pt"
          >
            A Test of Headers
          </htext>
        </hheading>
        <hheading level={2}>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="16pt"
          >
            Second Level
          </htext>
        </hheading>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some plain text.
          </htext>
        </hp>
        <hheading level={3}>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="14pt"
          >
            Third level
          </htext>
        </hheading>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hheading level={4}>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
          >
            Fourth level
          </htext>
        </hheading>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hheading level={5}>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
            italic
          >
            Fifth level
          </htext>
        </hheading>
        <hp>
          <htext fontFamily="Cambria, serif" fontSize="12pt">
            Some more plain text.
          </htext>
        </hp>
        <hheading level={6}>
          <htext
            color="#4F81BD"
            fontFamily="Calibri, sans-serif"
            fontSize="12pt"
          >
            Sixth level
          </htext>
        </hheading>
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
