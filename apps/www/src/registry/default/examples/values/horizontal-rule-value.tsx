/** @jsxRuntime classic */
/** @jsx jsx */
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>Horizontal Rule</hh2>
    <hp>
      Add horizontal rules to visually separate sections and content within your
      document.
    </hp>
    <element type={BaseHorizontalRulePlugin.key}>
      <htext />
    </element>
  </fragment>
);
