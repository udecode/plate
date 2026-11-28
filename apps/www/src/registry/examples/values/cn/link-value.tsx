/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const linkValue: Value = (
  <fragment>
    <hheading level={2}>链接</hheading>
    <hp>
      在文本中添加
      <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
        超链接
      </ha>
      或站内链接，例如 <ha url="/docs">Plate 文档</ha>
      。点击链接可预览、复制、编辑或移除，按住 <htext bold>Cmd/Ctrl</htext>{' '}
      点击可在新标签页中打开。
    </hp>
    <hp>
      选中文本后按 <htext bold>Cmd/Ctrl+K</htext>
      、点击工具栏按钮、在选中文本上粘贴 URL、输入{' '}
      <htext code>www.platejs.org</htext> 后按空格，或输入{' '}
      <htext code>[Plate](https://platejs.org)</htext> 即可创建链接。
    </hp>
  </fragment>
);
