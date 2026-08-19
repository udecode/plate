/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const tocValue = (
  <fragment>
    <hheading level={1}>
      <htext>目录</htext>
    </hheading>
    <hp>
      <htext>目录（TOC）功能允许您创建一个自动更新的文档结构概览。</htext>
    </hp>
    <hp>如何使用目录：</hp>
    <hp indent={1} listType="bulleted">
      <htext>输入 "/toc" 并按回车键创建目录。</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>当您修改文档中的标题时，目录会自动更新。</htext>
    </hp>
    <htoc>
      <htext />
    </htoc>
    <hheading level={2}>示例内容</hheading>
    <hp>
      <htext>这是一个会在目录中显示的内容示例。</htext>
    </hp>
    <hheading level={3}>子章节</hheading>
    <hp>
      <htext>在文档中添加或修改标题会自动更新目录。</htext>
    </hp>
    <hheading level={2}>使用目录的好处</hheading>
    <hp>
      <htext>目录可以改善文档导航，并提供内容结构的快速概览。</htext>
    </hp>
  </fragment>
);

export const tocPlaygroundValue = (
  <fragment>
    <htoc>
      <htext />
    </htoc>
    <hp>
      <htext>点击目录中的任何标题可以平滑滚动到该部分。</htext>
    </hp>
  </fragment>
);
