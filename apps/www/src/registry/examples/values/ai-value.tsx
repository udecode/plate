/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const aiValue: Value = (
  <fragment>
    <hheading level={2}>AI Menu</hheading>
    <hp>Generate and refine content with AI.</hp>
    <hp>Access the AI menu in many ways:</hp>
    <hp indent={1} listType="numbered">
      <htext>Press "⌘ + J".</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Select text and click "Ask AI" in the floating toolbar</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Right-click a block and select "Ask AI"</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Press space in an empty block. Try it out:</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext />
    </hp>
    <hp>Once opened, you can:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Search commands in the input field:</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Use arrow keys to navigate, Enter to select</htext>
    </hp>
    <hp>
      <htext>Generating commands:</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Continue writing</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Add a summary</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Explain</htext>
    </hp>
    <hp>
      <htext>Generating suggestions:</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Accept</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Discard</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Try again</htext>
    </hp>
    <hp>
      <htext>Editing commands:</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Improve writing</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Emojify</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Make it longer or shorter</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Fix spelling & grammar</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Simplify language</htext>
    </hp>
    <hp>Editing suggestions:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Replace the selection</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Insert below</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Discard</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Try again</htext>
    </hp>
    <hp>
      <htext>Note: chat history is preserved until the menu is closed.</htext>
    </hp>
  </fragment>
);
