/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { htmlBodyToFragment } from './htmlBodyToFragment';

jsx;

describe('when element is a body', () => {
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

  it('should be a fragment with the children', () => {
    expect(htmlBodyToFragment(input)).toEqual(output);
  });
});

describe('when element is not a body', () => {
  const input = {
    element: document.createElement('div'),
    children: [],
  };

  const output = undefined;

  it('should be undefined', () => {
    expect(htmlBodyToFragment(input)).toEqual(output);
  });
});
