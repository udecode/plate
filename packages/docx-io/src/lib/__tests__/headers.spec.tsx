/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'headers';

// mammoth output: h1-h6 preserved, no font styles
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh1>A Test of Headers</hh1>
        <hh2>Second Level</hh2>
        <hp>Some plain text.</hp>
        <hh3>Third level</hh3>
        <hp>Some more plain text.</hp>
        <hh4>Fourth level</hh4>
        <hp>Some more plain text.</hp>
        <hh5>Fifth level</hh5>
        <hp>Some more plain text.</hp>
        <hh6>Sixth level</hh6>
        <hp>Some more plain text.</hp>
        <hp>Seventh level</hp>
        <hp>
          Since no Heading 7 style exists in styles.xml, this gets converted to
          Span.
        </hp>
      </editor>
    ),
    filename: name,
  });
});
