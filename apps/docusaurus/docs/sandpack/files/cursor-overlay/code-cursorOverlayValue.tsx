export const cursorOverlayValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const cursorOverlayValue: any = (
  <fragment>
    <hp>This example shows two static cursors in red.</hp>
    <hp>
      Try also to drag over text: you will see a dynamic cursor on the drop
      target.
    </hp>
  </fragment>
);
`;

export const cursorOverlayValueFile = {
  '/cursor-overlay/cursorOverlayValue.tsx': cursorOverlayValueCode,
};
