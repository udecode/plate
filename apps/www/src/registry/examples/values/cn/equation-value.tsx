/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const equationValue: any = (
  <fragment>
    <hh2>
      <htext>公式</htext>
    </hh2>
    <hp indent={1} listStyleType="decimal">
      <htext>公式功能允许您以内联和块级格式表达复杂的数学概念。</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>主要特点：</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>支持 LaTeX 语法</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>支持内联和块级公式格式</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>内联公式示例：</htext>
      <hinlineequation texExpression="E=mc^2">
        <htext />
      </hinlineequation>
      <htext>（爱因斯坦著名的方程）</htext>
    </hp>
    <hp indent={1} listStart={4} listStyleType="decimal">
      <htext>块级公式示例：</htext>
    </hp>
    <hequation texExpression="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}">
      <htext />
    </hequation>
    <hp>
      <htext>用于求解</htext>
      <hinlineequation texExpression="ax^2 + bx + c = 0">
        <htext />
      </hinlineequation>
      <htext>的二次方程公式。</htext>
    </hp>
    <hequation texExpression="\int_{a}^{b} f(x) \, dx = F(b) - F(a)">
      <htext />
    </hequation>
    <hp>
      <htext>微积分基本定理。</htext>
    </hp>
    <hp indent={1} listStart={5} listStyleType="decimal">
      <htext>尝试以下操作：</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        点击任意公式进行编辑。按 Escape 键可以不保存编辑并关闭菜单。
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>您可以使用方向键在公式中导航</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>使用斜杠命令（/equation）插入新的公式</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>使用斜杠命令（/inline equation）插入内联公式</htext>
    </hp>
    <hp>
      <htext>
        高级用法：将公式与表格或代码块等其他元素结合，以创建全面的科学文档。例如：
      </htext>
    </hp>
    <hp>
      <htext>薛定谔方程，</htext>
      <hinlineequation texExpression="i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi">
        <htext />
      </hinlineequation>
      <htext>，是量子力学中的基本方程。</htext>
    </hp>
    <hp>
      <htext>
        尝试使用不同类型的公式和格式来在您的文档中创建丰富的数学内容。
      </htext>
    </hp>
  </fragment>
);
