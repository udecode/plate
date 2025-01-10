/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const toggleValue: any = (
  <fragment>
    <hh2>折叠</hh2>
    <hp>创建具有多级缩进的折叠内容</hp>
    <htoggle id="dlks89">第一级折叠</htoggle>
    <hp indent={1}>第一级折叠内容</hp>
    <htoggle id="kjdd12" indent={1}>
      第二级折叠
    </htoggle>
    <hp indent={2}>第二级折叠内容</hp>
    <hp>折叠内容之后</hp>
  </fragment>
);
