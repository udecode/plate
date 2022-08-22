export const singleLineValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const singleLineValue: any = (
  <fragment>
    <hp>You cannot type or paste text with multiple lines.</hp>
  </fragment>
);
`;

export const singleLineValueFile = {
  '/single-line/singleLineValue.tsx': singleLineValueCode,
};
