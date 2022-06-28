export const placeholderValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const placeholderValue: any = (
  <fragment>
    <hh1>
      <htext />
    </hh1>
    <hp>
      <htext />
    </hp>
  </fragment>
);
`;

export const placeholderValueFile = {
  '/placeholder/placeholderValue.tsx': placeholderValueCode,
};
