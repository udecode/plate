/** @jsxRuntime classic */
/** @jsx jsx */
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>Horizontal Rule</hh2>
    <hp>
      Add horizontal rules to visually separate sections and content within your
      document.
    </hp>
    <element type={ELEMENT_HR}>
      <htext />
    </element>
  </fragment>
);
