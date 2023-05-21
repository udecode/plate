/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const basicMarksValue: any = (
  <fragment>
    <hh1>💅 Marks</hh1>
    <hh2>💧 Basic Marks</hh2>
    <hp>
      The basic marks consist of text formatting such as bold, italic,
      underline, strikethrough, subscript, superscript, and code.
    </hp>
    <hp>
      You can customize the type, the component and the hotkey for each of
      these.
    </hp>
    <hp>
      <htext bold>This text is bold.</htext>
    </hp>
    <hp>
      <htext italic>This text is italic.</htext>
    </hp>
    <hp>
      <htext underline>This text is underlined.</htext>
    </hp>
    <hp>
      <htext bold italic underline>
        This text is bold, italic and underlined.
      </htext>
    </hp>
    <hp>
      <htext strikethrough>This is a strikethrough text.</htext>
    </hp>
    <hp>
      <htext code>This is an inline code.</htext>
    </hp>
  </fragment>
);
