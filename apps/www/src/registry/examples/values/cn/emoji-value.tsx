/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const emojiValue: Value = (
  <fragment>
    <hheading level={2}>表情符号</hheading>
    <hp>用一点趣味 🎉 和情感 😃 来表达自己。</hp>
    <hp>从工具栏选择或输入冒号以打开组合框。</hp>
  </fragment>
);
