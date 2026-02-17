/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'lists';

// BaseListPlugin uses indent-based lists, so nested ol/ul/li from mammoth
// are deserialized into flat paragraphs (list structure is flattened).
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh2>Some nested lists</hh2>
        <hp>one</hp>
        <hp>two</hp>
        <hp>a</hp>
        <hp>b</hp>
        <hp>one</hp>
        <hp>two</hp>
        <hp>three</hp>
        <hp>four</hp>
        <hp>Sub paragraph</hp>
        <hp>Same list</hp>
        <hp>Different list adjacent to the one above.</hp>
      </editor>
    ),
    filename: name,
  });
});
