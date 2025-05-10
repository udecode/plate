/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const tabbableValue: any = (
  <fragment>
    <hh2>可Tab</hh2>
    <hp>使用Tabbable插件确保编辑器内的平滑标签导航体验。</hp>
    <hp>
      正确处理空节点的制表顺序，实现无缝导航和交互。如果没有这个插件，空节点内的
      DOM 元素在制表顺序中会排在编辑器之后。
    </hp>
    <element type="tabbable">
      <htext />
    </element>
    <element type="tabbable">
      <htext />
    </element>
    <hp>将光标放在这里，然后尝试按 Tab 或 Shift+Tab。</hp>
    <hp indent={1} listStyleType="disc">
      列表项 1
    </hp>
    <hp indent={1} listStyleType="disc">
      列表项 2
    </hp>
    <hp indent={1} listStyleType="disc">
      列表项 3
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>if (true) {'{'}</hcodeline>
      <hcodeline>{'// <-'} 将光标放在行首并按 Tab 键</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
    <hp>
      在此示例中，当光标在列表或代码块内时，插件会被禁用。您可以使用{' '}
      <htext code>query</htext> 选项来自定义此行为。
    </hp>
    <element type="tabbable">
      <htext />
    </element>
    <hp>当您在编辑器末尾按 Tab 键时，焦点应该移到下面的按钮。</hp>
  </fragment>
);
