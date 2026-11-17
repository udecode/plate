/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const formatPainterValue: Value = (
  <fragment>
    <hheading level={2}>格式刷</hheading>
    <hp>
      选中
      <htext bold color="#df4538">
        这段红色粗体
      </htext>
      ，点击工具栏的格式刷，再拖选其他文字，它就会换上同样的样式。双击格式刷可以连续刷，按{' '}
      <htext code>Esc</htext> 结束。
    </hp>
    <hp>
      不用工具栏时，按 <htext code>Mod+Alt+C</htext> 复制样式，按{' '}
      <htext code>Mod+Alt+V</htext> 把它粘贴到选区上。
    </hp>
    <hheading level={3}>把标题刷到段落上</hheading>
    <hp>选中上面的标题，拿起格式刷，再拖选这整段，它就会变成标题。</hp>
    <hp lineHeight={2} textAlign="center">
      把红色粗体刷到这整段居中的文字上，它会换上样式，同时保留对齐方式和行高。
    </hp>
  </fragment>
);
