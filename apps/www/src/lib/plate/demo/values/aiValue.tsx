/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const aiValue: any = (
  <fragment>
    <hh1>AI</hh1>
    <hh2>AI Menu</hh2>
    <hp indent={1} listStyleType="decimal">
      <htext>To trigger the AI menu, you can:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Press the Space key on a new empty block</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Select text then click the AI icon in the floating toolbar</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>
        Type your prompt or question in the input field that appears.
      </htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Press Enter to submit your prompt and generate AI content.</htext>
    </hp>
    <hp indent={1} listStart={4} listStyleType="decimal">
      <htext>
        The AI will generate content based on your prompt. You can then:
      </htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Edit the generated content as needed</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Accept the content as is</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext>Regenerate the content with a different prompt</htext>
    </hp>
  </fragment>
);
