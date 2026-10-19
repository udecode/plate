/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const lintValue: Value = (
  <fragment>
    <hheading level={2}>检查</hheading>
    <hp>
      编辑器会在你输入时检查每个段落。示例规则面向英文：下面的句子里，填充词和逗号前的空格会带波浪下划线。
    </hp>
    <hp>
      This editor really checks each paragraph , and basically every fix is one
      undo step.
    </hp>
    <hp>
      把光标放在带下划线的词上可以查看修复建议，按 F8 和 Shift+F8
      在问题之间移动。点击 Check with server 会加入一条较慢的规则，它标记 e-mail
      和 web site，并在短暂延迟后返回结果。
    </hp>
    <hblockquote>
      Quotes are really checked too , like any paragraph.
    </hblockquote>
    <hp>代码块不会被检查：</hp>
    <hcodeblock language="javascript">
      {'const really = true , very = false; // e-mail'}
    </hcodeblock>
  </fragment>
);
