/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const aiValue: any = (
  <fragment>
    <hh2>AI Menu</hh2>
    <hp>
      The AI Menu provides powerful AI-assisted writing and editing
      capabilities.
    </hp>
    <hp>Ways to access the AI Menu:</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>
        Press space in an empty block or select text to see "Ask AI" in the
        floating toolbar.
      </htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Press "⌘ + J".</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Select text to access AI options for the selection.</htext>
    </hp>
    <hp>Using the AI Menu:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Ask anything in the search bar or choose from preset options:
      </htext>
      <hp indent={2} listStyleType="circle">
        <htext>Continue writing</htext>
      </hp>
      <hp indent={2} listStyleType="circle">
        <htext>Add a summary</htext>
      </hp>
      <hp indent={2} listStyleType="circle">
        <htext>Explain</htext>
      </hp>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>For generated content, you can:</htext>
      <hp indent={2} listStyleType="circle">
        <htext>Accept it (inserts directly into the editor)</htext>
      </hp>
      <hp indent={2} listStyleType="circle">
        <htext>Discard it</htext>
      </hp>
      <hp indent={2} listStyleType="circle">
        <htext>Try again for another suggestion</htext>
      </hp>
    </hp>
    <hp>AI options for selected text:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Improve writing</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Make it longer or shorter</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Fix spelling & grammar</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Simplify language</htext>
    </hp>
    <hp>For AI suggestions on selected text, you can:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Replace the selection</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Insert below</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Discard</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Try again</htext>
    </hp>
    <hcallout variant="info" icon="💡">
      <htext>
        Press Escape to close the AI menu or stop the AI generation process.
      </htext>
    </hcallout>
  </fragment>
);
