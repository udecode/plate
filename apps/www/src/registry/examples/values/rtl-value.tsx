/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

const sample = ({
  code,
  heading,
  intro,
  lists,
  other,
  quote,
  table,
}: {
  code: { heading: string; text: string };
  heading: string;
  intro: string;
  lists: {
    first: string;
    heading: string;
    nested: string;
    task: string;
    third: string;
  };
  other: string;
  quote: string;
  table: {
    heading: string;
    name: string;
    nameValue: string;
    role: string;
    roleValue: string;
  };
}): Value => (
  <fragment>
    <hheading level={2}>{heading}</hheading>
    <hp>{intro}</hp>
    <hp>{other}</hp>
    <hheading level={3}>{lists.heading}</hheading>
    <hp indent={1} listType="bulleted">
      {lists.first}
    </hp>
    <hp indent={2} listType="bulleted">
      {lists.nested}
    </hp>
    <hp indent={3} listType="numbered">
      {lists.third}
    </hp>
    <hp checked={false} indent={1} listType="task">
      {lists.task}
    </hp>
    <hblockquote>{quote}</hblockquote>
    <hheading level={3}>{code.heading}</hheading>
    <hp>
      <htext>{code.text}</htext>
      <hinlineequation latex="E=mc^2">
        <htext />
      </hinlineequation>
      <htext />
    </hp>
    <hcodeblock language="javascript">
      {'const direction = document.dir;'}
    </hcodeblock>
    <hequation latex="\int_a^b f(x)\,dx = F(b) - F(a)">
      <htext />
    </hequation>
    <hheading level={3}>{table.heading}</hheading>
    <htable columnWidths={[160, 160]}>
      <htr>
        <hth>
          <hp>
            <htext bold>{table.name}</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>{table.role}</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>{table.nameValue}</hp>
        </htd>
        <htd>
          <hp>{table.roleValue}</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const rtlValues = {
  ar: sample({
    code: {
      heading: 'الشيفرة والمعادلات',
      text: 'تبقى الشيفرة والمعادلات من اليسار إلى اليمين: ',
    },
    heading: 'التحرير من اليمين إلى اليسار',
    intro:
      'تأخذ كل فقرة اتجاهها من أول حرف فيها، لذلك تبدأ الفقرة العربية من اليمين.',
    lists: {
      first: 'العنصر الأول',
      heading: 'القوائم والإزاحة',
      nested: 'عنصر متداخل، مُزاح من اليمين',
      task: 'مهمة مفتوحة',
      third: 'المستوى الثالث',
    },
    other:
      'An English paragraph keeps its left-to-right direction inside a right-to-left document.',
    quote: 'اقتباس بخط على الجانب الأيمن.',
    table: {
      heading: 'جدول',
      name: 'الاسم',
      nameValue: 'سارة',
      role: 'الدور',
      roleValue: 'محررة',
    },
  }),
  en: sample({
    code: {
      heading: 'Code and equations',
      text: 'Code and equations stay left-to-right: ',
    },
    heading: 'Editing in both directions',
    intro:
      'Each paragraph takes its direction from its first letter, so an English paragraph starts at the left.',
    lists: {
      first: 'First item',
      heading: 'Lists and indent',
      nested: 'Nested item, indented from the left',
      task: 'Open task',
      third: 'Third level',
    },
    other: 'تبقى الفقرة العربية من اليمين إلى اليسار داخل مستند إنجليزي.',
    quote: 'A quote with a bar on the left side.',
    table: {
      heading: 'Table',
      name: 'Name',
      nameValue: 'Sara',
      role: 'Role',
      roleValue: 'Editor',
    },
  }),
  he: sample({
    code: {
      heading: 'קוד ונוסחאות',
      text: 'קוד ונוסחאות נשארים משמאל לימין: ',
    },
    heading: 'עריכה מימין לשמאל',
    intro:
      'כל פסקה מקבלת את הכיוון שלה מהאות הראשונה שבה, ולכן פסקה בעברית מתחילה מימין.',
    lists: {
      first: 'פריט ראשון',
      heading: 'רשימות והזחה',
      nested: 'פריט מקונן, מוזח מימין',
      task: 'משימה פתוחה',
      third: 'רמה שלישית',
    },
    other:
      'An English paragraph keeps its left-to-right direction inside a right-to-left document.',
    quote: 'ציטוט עם פס בצד ימין.',
    table: {
      heading: 'טבלה',
      name: 'שם',
      nameValue: 'דנה',
      role: 'תפקיד',
      roleValue: 'עורכת',
    },
  }),
} satisfies Record<string, Value>;
