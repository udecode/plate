/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const aiValue: Value = (
  <fragment>
    <hheading level={2}>AI 菜单</hheading>
    <hp>使用 AI 生成和优化内容。</hp>
    <hp>可以通过多种方式访问 AI 菜单：</hp>
    <hp indent={1} listType="numbered">
      <htext>按下 "⌘ + J"。</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>选择文本并点击浮动工具栏中的"询问 AI"</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>右键点击块并选择"询问 AI"</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>在空白块中按空格键。试一试：</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext />
    </hp>
    <hp>打开后，你可以：</hp>
    <hp indent={1} listType="bulleted">
      <htext>在输入框中搜索命令：</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>使用方向键导航，回车键选择</htext>
    </hp>
    <hp>
      <htext>生成命令：</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>继续写作</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>添加摘要</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>解释</htext>
    </hp>
    <hp>
      <htext>生成建议：</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>接受</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>放弃</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>重试</htext>
    </hp>
    <hp>
      <htext>编辑命令：</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>改进写作</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>加长或缩短</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>修正拼写和语法</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>简化语言</htext>
    </hp>
    <hp>编辑建议：</hp>
    <hp indent={1} listType="bulleted">
      <htext>替换选中内容</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>在下方插入</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>放弃</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>重试</htext>
    </hp>
    <hp>
      <htext>注意：聊天历史会保留到菜单关闭为止。</htext>
    </hp>
  </fragment>
);
