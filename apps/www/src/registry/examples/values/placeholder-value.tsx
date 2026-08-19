/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const blockPlaceholderValue = (
  <fragment>
    <hheading level={2}>Placeholder</hheading>
    <hp>
      Show a placeholder when selecting an empty block. Try it out on the next
      block:
    </hp>
    <hp>
      <htext />
    </hp>
  </fragment>
);
