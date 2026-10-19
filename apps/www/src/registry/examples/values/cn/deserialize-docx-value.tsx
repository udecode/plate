/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const deserializeDocxValue: Value = (
  <fragment>
    <hheading level={2}>Docx</hheading>
    <hp>
      通过简单地将 Docx 内容复制并粘贴到编辑器中，即可轻松导入 Microsoft Word
      文档的内容。
    </hp>
  </fragment>
);
