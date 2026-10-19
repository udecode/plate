/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const floatingToolbarValue: Value = (
  <fragment>
    <hheading level={2}>Floating Toolbar</hheading>
    <hp>
      The floating toolbar provides quick access to formatting options and
      actions for selected text.
    </hp>
    <hp>How to use the floating toolbar:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Select any text to invoke the floating toolbar.</htext>
    </hp>
    <hp>With the floating toolbar, you can:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Ask AI for assistance</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Add a comment to the selected text</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Turn a block type into another one</htext>
    </hp>
    <hp indent={1} listType="bulleted">
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
