/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const rtlValue: Value = (
  <fragment>
    <hheading level={2}>עריכה מימין לשמאל</hheading>
    <hp>
      כל פסקה מקבלת את הכיוון שלה מהאות הראשונה שבה, ולכן פסקה בעברית מתחילה
      מימין.
    </hp>
    <hp>
      An English paragraph keeps its left-to-right direction inside a
      right-to-left document.
    </hp>
    <hheading level={3}>רשימות והזחה</hheading>
    <hp indent={1} listType="bulleted">
      פריט ראשון
    </hp>
    <hp indent={2} listType="bulleted">
      פריט מקונן, מוזח מימין
    </hp>
    <hp indent={3} listType="numbered">
      רמה שלישית
    </hp>
    <hp checked={false} indent={1} listType="task">
      משימה פתוחה
    </hp>
    <hblockquote>ציטוט עם פס בצד ימין.</hblockquote>
    <hheading level={3}>קוד ונוסחאות</hheading>
    <hp>
      <htext>קוד ונוסחאות נשארים משמאל לימין: </htext>
      <hinlineequation latex="E=mc^2">
        <htext />
      </hinlineequation>
      <htext />
    </hp>
    <hcodeblock language="javascript">{'const direction = "rtl";'}</hcodeblock>
    <hequation latex="\int_a^b f(x)\,dx = F(b) - F(a)">
      <htext />
    </hequation>
    <hheading level={3}>טבלה</hheading>
    <htable columnWidths={[160, 160]}>
      <htr>
        <hth>
          <hp>
            <htext bold>שם</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>תפקיד</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>דנה</hp>
        </htd>
        <htd>
          <hp>עורכת</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);
