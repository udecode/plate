/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const equationValue: any = (
  <fragment>
    <hh2>
      <htext>Equation</htext>
    </hh2>
    <hp indent={1} listStyleType="decimal">
      <htext>
        Equations allow you to express complex mathematical concepts in both
        inline and block formats.
      </htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Key features:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>LaTeX syntax support</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Inline and block equation formats</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Inline equation example: </htext>
      <hinlineequation texExpression="E=mc^2">
        <htext />
      </hinlineequation>
      <htext> (Einstein's famous equation)</htext>
    </hp>
    <hp indent={1} listStart={4} listStyleType="decimal">
      <htext>Block equation examples:</htext>
    </hp>
    <hequation texExpression="\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}">
      <htext />
    </hequation>
    <hp>
      <htext>The quadratic formula for solving </htext>
      <hinlineequation texExpression="ax^2 + bx + c = 0">
        <htext />
      </hinlineequation>
      <htext>.</htext>
    </hp>
    <hequation texExpression="\int_{a}^{b} f(x) \, dx = F(b) - F(a)">
      <htext />
    </hequation>
    <hp>
      <htext>The fundamental theorem of calculus.</htext>
    </hp>
    <hp indent={1} listStart={5} listStyleType="decimal">
      <htext>Try these actions:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        Click on any equation to edit it. Press Escape to close the menu without
        editing it.
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        You can navigate through the equation by using the arrow keys
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Use the slash command (/equation) to insert a new equation</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>
        Use the slash command (/inline equation) for inline equations
      </htext>
    </hp>
    <hp>
      <htext>
        Advanced usage: Combine equations with other elements like tables or
        code blocks for comprehensive scientific documentation. For example:
      </htext>
    </hp>
    <hp>
      <htext>The Schrödinger equation, </htext>
      <hinlineequation texExpression="i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi">
        <htext />
      </hinlineequation>
      <htext>, is fundamental in quantum mechanics.</htext>
    </hp>
    <hp>
      <htext>
        Experiment with different equation types and formatting to create rich,
        mathematical content in your documents.
      </htext>
    </hp>
  </fragment>
);
