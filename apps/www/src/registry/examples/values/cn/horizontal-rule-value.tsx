/** @jsxRuntime classic */
/** @jsx jsx */
import { KEYS } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const horizontalRuleValue: any = (
  <fragment>
    <hh2>分隔线</hh2>
    <hp>添加分隔线以在文档中直观地分隔不同的章节和内容。</hp>
    <element type={KEYS.hr}>
      <htext />
    </element>
  </fragment>
);
