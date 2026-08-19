/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const cursorOverlayValue = (
  <fragment>
    <hheading level={2}>Cursor Overlay</hheading>
    <hp>
      Try to drag over text: you will see a colored cursor on the drop target:
      color and other styles are customizable!
    </hp>
    <hp>
      You can also try clicking the "Ask AI" button - the selection will stay
      visible while focusing the another input, and will be updated while
      streaming.
    </hp>
  </fragment>
);
