/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const lineHeightValue: Value = (
  <fragment>
    <hheading level={2}>Line Height</hheading>
    <hp>
      Control the line height of your text to improve readability and adjust the
      spacing between lines.
    </hp>
    <hp lineHeight={2}>
      Choose the ideal line height to ensure comfortable reading and an
      aesthetically pleasing document.
    </hp>
  </fragment>
);
