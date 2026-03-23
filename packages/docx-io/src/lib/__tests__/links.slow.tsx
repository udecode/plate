/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'links';

// mammoth output: links preserved with target="_blank"
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh2>An internal link and an external link</hh2>
        <hp>
          An{' '}
          <ha url="http://google.com" target="_blank">
            external link
          </ha>{' '}
          to a popular website.
        </hp>
        <hp>
          An{' '}
          <ha url="http://pandoc.org/README.html#synopsis" target="_blank">
            external link
          </ha>{' '}
          to a website with an anchor.
        </hp>
        <hp>
          An{' '}
          <ha url="#_A_section_for" target="_blank">
            internal link
          </ha>{' '}
          to a section header.
        </hp>
        <hp>
          An{' '}
          <ha url="#my_bookmark" target="_blank">
            internal link
          </ha>{' '}
          to a bookmark.
        </hp>
        <hh2>A section for testing link targets</hh2>
        <hp>A bookmark right here</hp>
      </editor>
    ),
    filename: name,
  });
});
