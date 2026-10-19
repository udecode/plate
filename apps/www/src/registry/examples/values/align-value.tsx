/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const alignValue: Value = (
  <fragment>
    <hheading level={2} textAlign="right">
      Alignment
    </hheading>
    <hp textAlign="right">
      Align text within blocks to create visually appealing and balanced
      layouts.
    </hp>
    <hheading level={3} textAlign="center">
      Center
    </hheading>
    <hp textAlign="justify">
      Create clean and balanced layouts by justifying block text, providing a
      professional and polished look.
    </hp>
  </fragment>
);
