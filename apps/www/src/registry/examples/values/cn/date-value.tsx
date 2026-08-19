/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

const today = new Date().toISOString().split('T')[0];

export const dateValue = (
  <fragment>
    <hheading level={2}>日期</hheading>
    <hp>
      使用内联日期元素在文本中插入和显示日期。
      这些日期可以通过日历界面轻松选择和修改。
    </hp>
    <hp>
      试着选择{' '}
      <hdate value="2024-01-01">
        <htext />
      </hdate>{' '}
      或{' '}
      <hdate value={today}>
        <htext />
      </hdate>
      。
    </hp>
  </fragment>
);
