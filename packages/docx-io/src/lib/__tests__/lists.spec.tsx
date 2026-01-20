/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'lists';

// TODO: ListPlugin uses indent-based lists, not nested structure
// mammoth output: ol/ul preserved with nesting
describe.skip(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh2>Some nested lists</hh2>
        <hol>
          <hli>
            <hlic>one</hlic>
          </hli>
          <hli>
            <hlic>two</hlic>
            <hol>
              <hli>
                <hlic>a</hlic>
              </hli>
              <hli>
                <hlic>b</hlic>
              </hli>
            </hol>
          </hli>
        </hol>
        <hul>
          <hli>
            <hlic>one</hlic>
          </hli>
          <hli>
            <hlic>two</hlic>
            <hul>
              <hli>
                <hlic>three</hlic>
                <hul>
                  <hli>
                    <hlic>four</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>Sub paragraph</hp>
        <hul>
          <hli>
            <hlic>Same list</hlic>
          </hli>
          <hli>
            <hlic>Different list adjacent to the one above.</hlic>
          </hli>
        </hul>
      </editor>
    ),
    filename: name,
  });
});
