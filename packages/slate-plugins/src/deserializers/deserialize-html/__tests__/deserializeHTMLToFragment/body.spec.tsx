/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { deserializeHTMLToFragment } from '../../utils/deserializeHTMLToFragment';

const fragment = (
  <fragment>
    <hp>
      <htext>test</htext>
    </hp>
  </fragment>
);

const input = {
  element: document.createElement('body'),
  children: fragment,
} as any;

const output = fragment;

it('should be', () => {
  expect(deserializeHTMLToFragment(input)).toEqual(output);
});
