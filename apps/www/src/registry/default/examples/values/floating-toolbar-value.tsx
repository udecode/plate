/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const floatingToolbarValue: any = (
  <fragment>
    <hh2>Floating Toolbar</hh2>
    <hp>
      The floating toolbar provides quick access to formatting options and
      actions for selected text.
    </hp>
    <hp>How to use the floating toolbar:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Select any text to invoke the floating toolbar.</htext>
    </hp>
    <hp>With the floating toolbar, you can:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Ask AI for assistance</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Add a comment to the selected text</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Turn a block type into another one</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Apply text formatting: bold, italic, underline, strikethrough, code
      </htext>
    </hp>
    <hp>
      <htext>
        Try selecting some text below to see the floating toolbar in action:
      </htext>
    </hp>
    <hp>
      <htext bold>Bold text</htext>
      <htext>, </htext>
      <htext italic>italic text</htext>
      <htext>, </htext>
      <htext underline>underlined text</htext>
      <htext>, and </htext>
      <htext bold italic underline>
        combined formatting
      </htext>
      <htext>.</htext>
    </hp>
  </fragment>
);
