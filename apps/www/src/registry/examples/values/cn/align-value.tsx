/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const alignValue: Value = (
  <fragment>
    <hheading level={2} textAlign="right">
      对齐
    </hheading>
    <hp textAlign="right">在块内对齐文本以创建视觉上吸引人且平衡的布局。</hp>
    <hheading level={3} textAlign="center">
      居中
    </hheading>
    <hp textAlign="justify">
      通过两端对齐块文本创建整洁和平衡的布局，提供专业和精致的外观。
    </hp>
  </fragment>
);
