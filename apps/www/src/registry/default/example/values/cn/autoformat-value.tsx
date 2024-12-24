/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const autoformatValue: any = (
  <fragment>
    <hh2>自动格式化</hh2>
    <hp>
      通过启用自动格式化功能来增强你的写作体验。添加类似 Markdown
      的快捷方式，在输入时自动应用格式。
    </hp>
    <hp>在输入时，试试这些标记规则：</hp>
    <hp indent={1} listStyleType="disc">
      在文本两侧输入 <htext code>**</htext> 或 <htext code>__</htext> 来添加
      **粗体** 标记。
    </hp>
    <hp indent={1} listStyleType="disc">
      在文本两侧输入 <htext code>*</htext> 或 <htext code>_</htext> 来添加
      *斜体* 标记。
    </hp>

    <hp indent={1} listStyleType="disc">
      在文本两侧输入 <htext code>`</htext> 来添加 `行内代码` 标记。
    </hp>

    <hp indent={1} listStyleType="disc">
      在文本两侧输入 <htext code>~~</htext> 来添加 ~~删除线~~ 标记。
    </hp>
    <hp indent={1} listStyleType="disc">
      注意，如果前面有字符则不会生效，试试：*粗体
    </hp>
    <hp indent={1} listStyleType="disc">
      我们甚至支持智能引号，试着输入 <htext code>"你好" '世界'</htext>。
    </hp>

    <hp>在任何新块或现有块的开头，试试这些（块规则）：</hp>

    <hp indent={1} listStyleType="disc">
      输入 <htext code>*</htext>、<htext code>-</htext> 或 <htext code>+</htext>
      后跟 <htext code>空格</htext> 来创建无序列表。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>1.</htext> 或 <htext code>1)</htext> 后跟{' '}
      <htext code>空格</htext>
      来创建有序列表。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>[]</htext> 或 <htext code>[x]</htext>
      后跟 <htext code>空格</htext> 来创建待办事项列表。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>&gt;</htext> 后跟 <htext code>空格</htext> 来创建引用块。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>```</htext> 来创建代码块。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>---</htext> 来创建水平分割线。
    </hp>

    <hp indent={1} listStyleType="disc">
      输入 <htext code>#</htext> 后跟 <htext code>空格</htext> 来创建一级标题。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>###</htext> 后跟 <htext code>空格</htext>{' '}
      来创建三级标题。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>####</htext> 后跟 <htext code>空格</htext>{' '}
      来创建四级标题。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>#####</htext> 后跟 <htext code>空格</htext>{' '}
      来创建五级标题。
    </hp>
    <hp indent={1} listStyleType="disc">
      输入 <htext code>######</htext> 后跟 <htext code>空格</htext>{' '}
      来创建六级标题。
    </hp>
  </fragment>
);
