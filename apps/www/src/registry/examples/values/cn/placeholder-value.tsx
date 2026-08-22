/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const placeholderValue: Value = (
  <fragment>
    <hheading level={2}>占位符</hheading>
    <hp>当选择一个空白块时显示占位符。在下一个块中试试看：</hp>
    <hp>
      <htext />
    </hp>
  </fragment>
);
