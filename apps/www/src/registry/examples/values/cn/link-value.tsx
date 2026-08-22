/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const linkValue: Value = (
  <fragment>
    <hheading level={2}>链接</hheading>
    <hp>
      使用链接插件在文本中添加
      <ha url="https://en.wikipedia.org/wiki/Hypertext">超链接</ha>{' '}
      来引用外部资源或提供额外信息。
    </hp>
    <hp>使用工具栏或在选择所需文本时粘贴 URL，轻松创建超链接。</hp>
  </fragment>
);
