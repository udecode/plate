/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const copilotValue = (
  <fragment>
    <hheading level={2}>Copilot</hheading>
    <hp indent={1} listType="numbered">
      <htext>将光标放在</htext>
      <htext bold>段落末尾</htext>
      <htext>，你想要在此添加或修改文本。</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>按下 Control + Space 触发 Copilot</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Copilot 将</htext>
      <htext bold>自动</htext>
      <htext>在你输入时提供补全建议。</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>从建议的补全中选择：</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Tab</htext>：<htext>接受整个建议的补全</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Command + 右箭头</htext>
      <htext>：一次完成一个字符</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Escape</htext>
      <htext>：取消 Copilot</htext>
    </hp>
  </fragment>
);
