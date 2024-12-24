/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const slashCommandValue: any = (
  <fragment>
    <hh2>
      <htext>斜杠命令</htext>
    </hh2>
    <hp>
      <htext>斜杠菜单提供了快速访问各种格式化选项和内容类型的方式。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>在文档中的任何位置输入 '/' 即可打开斜杠菜单。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>开始输入以筛选选项，或使用方向键导航。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>按回车键或点击以选择选项。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>按 Escape 键可以不选择而关闭菜单。</htext>
    </hp>
    <hp>可用选项包括：</hp>
    <hp indent={1} listStyleType="disc">
      <htext>标题：一级标题、二级标题、三级标题</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>列表：无序列表、有序列表</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>内联元素：日期</htext>
    </hp>
    {/* <hcallout variant="info" icon="💡">
      <htext>
        使用关键词可以快速找到选项。例如，输入 '/h1' 可插入一级标题，
        '/ul' 可插入无序列表，或 '/date' 可插入日期。
      </htext>
    </hcallout> */}
  </fragment>
);
