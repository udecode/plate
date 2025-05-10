/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

const today = new Date().toISOString().split('T')[0];

export const dateValue: any = (
  <fragment>
    <hh2>日期</hh2>
    <hp>
      使用内联日期元素在文本中插入和显示日期。
      这些日期可以通过日历界面轻松选择和修改。
    </hp>
    <hp>
      试着选择{' '}
      <hdate date="2024-01-01">
        <htext />
      </hdate>{' '}
      或{' '}
      <hdate date={today}>
        <htext />
      </hdate>
      。
    </hp>
  </fragment>
);
