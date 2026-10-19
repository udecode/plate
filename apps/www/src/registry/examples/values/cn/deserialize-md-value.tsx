/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const deserializeMdValue: Value = (
  <fragment>
    <hheading level={2}>Markdown</hheading>
    <hp>
      从流行的 Markdown 编辑器（如{' '}
      <ha url="https://markdown-it.github.io/">markdown-it.github.io/</ha>）
      复制并粘贴 Markdown 内容到编辑器中，以便轻松转换和编辑。
    </hp>
    <hp>试试嵌套引用块、引用列表项和回复式引用链，粘贴后仍能保留原有结构。</hp>
  </fragment>
);
