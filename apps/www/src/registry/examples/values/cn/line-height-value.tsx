/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const lineHeightValue: Value = (
  <fragment>
    <hheading level={2}>行高</hheading>
    <hp>控制文本的行高以提高可读性并调整行间距。</hp>
    <hp lineHeight={2}>选择理想的行高以确保舒适的阅读体验和美观的文档布局。</hp>
  </fragment>
);
