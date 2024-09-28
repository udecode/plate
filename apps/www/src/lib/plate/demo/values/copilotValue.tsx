/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const copilotValue: any = (
  <fragment>
    <hh1>🤖 Copilot</hh1>
    <hp indent={1} listStyleType="decimal">
      <htext>Position your cursor at the</htext>
      <htext bold> end of a paragraph </htext>
      <htext>where you want to add or modify text.</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Press Control + Space to trigger Copilot.</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Choose from the suggested completions:</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Tab</htext>:
      <htext>Accept the entire suggested completion</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Command + Right Arrow</htext>
      <htext>: Complete one character at a time</htext>
    </hp>
    <hp indent={2} listStyleType="disc">
      <htext bold>Escape</htext>
      <htext>: Cancel the Copilot</htext>
    </hp>
  </fragment>
);
