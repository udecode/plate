/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const detailsValue: Value = (
  <fragment>
    <hheading level={2}>详细信息</hheading>
    <hp>使用摘要显示或隐藏一个或多个内容块。</hp>
    <hdetails>
      <hsummary>为什么使用语义化详细信息？</hsummary>
      <hp>文档模型与原生 HTML 一致，并将内容块保持在容器内。</hp>
      <hdetails>
        <hsummary>可以嵌套详细信息吗？</hsummary>
        <hp>可以。嵌套的详细信息是普通的内容块。</hp>
      </hdetails>
    </hdetails>
    <hp>详细信息之后的内容仍是普通的同级块。</hp>
  </fragment>
);
