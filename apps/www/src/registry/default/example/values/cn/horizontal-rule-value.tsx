/** @jsxRuntime classic */
/** @jsx jsx */
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>分隔线</hh2>
    <hp>添加分隔线以在文档中直观地分隔不同的章节和内容。</hp>
    <element type={BaseHorizontalRulePlugin.key}>
      <htext />
    </element>
  </fragment>
);
