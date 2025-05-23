/** @jsxRuntime classic */
/** @jsx jsx */
import { KEYS } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>Horizontal Rule</hh2>
    <hp>
      Add horizontal rules to visually separate sections and content within your
      document.
    </hp>
    <element type={KEYS.hr}>
      <htext />
    </element>
  </fragment>
);
