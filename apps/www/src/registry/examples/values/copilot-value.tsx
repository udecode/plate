/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const copilotValue: Value = (
  <fragment>
    <hheading level={2}>Copilot</hheading>
    <hp indent={1} listType="numbered">
      <htext>Position your cursor at the</htext>
      <htext bold> end of a paragraph </htext>
      <htext>where you want to add or modify text.</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Press Control + Space to trigger Copilot</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Copilot will</htext>
      <htext bold> automatically</htext>
      <htext> suggest completions as you type.</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Choose from the suggested completions:</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Tab</htext>:
      <htext>Accept the entire suggested completion</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Command + Right Arrow</htext>
      <htext>: Complete one character at a time</htext>
    </hp>
    <hp indent={2} listType="bulleted">
      <htext bold>Escape</htext>
      <htext>: Cancel the Copilot</htext>
    </hp>
  </fragment>
);
