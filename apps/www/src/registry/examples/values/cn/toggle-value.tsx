/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const toggleValue: Value = (
  <fragment>
    <hheading level={2}>折叠</hheading>
    <hp>创建具有多级缩进的折叠内容</hp>
    <htoggle>第一级折叠</htoggle>
    <hp indent={1}>第一级折叠内容</hp>
    <htoggle indent={1}>
      第二级折叠
    </htoggle>
    <hp indent={2}>第二级折叠内容</hp>
    <hp>折叠内容之后</hp>
  </fragment>
);
