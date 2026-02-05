/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const pluginRulesValue: any = (
  <fragment>
    <hh2>Plugin Rules</hh2>
    <hp>
      Plugin rules control how blocks respond to Enter, Backspace, selection,
      and normalization.
    </hp>

    <hh3>Break Rules</hh3>

    <hp>
      <htext bold>Heading splitReset:</htext> Press Enter in middle of heading
      to split and reset new block to paragraph.
    </hp>
    <hh3>Press Enter after "Press" to see splitReset behavior</hh3>

    <hp>
      <htext bold>Blockquote with line breaks:</htext> Enter adds line breaks,
      Enter on empty lines resets to paragraph.
    </hp>
    <hblockquote>
      This blockquote uses lineBreak rules. Press Enter here for line breaks.
    </hblockquote>

    <hh3>Delete Rules</hh3>

    <hp>
      <htext bold>Code block reset:</htext> Backspace in empty code block resets
      to paragraph.
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>console.info('Hello world');</hcodeline>
      <hcodeline>
        <text />
      </hcodeline>
    </hcodeblock>

    <hp>
      <htext bold>List items:</htext> Backspace at start removes list
      formatting.
    </hp>
    <hp indent={1} listStyleType="disc">
      Press Backspace at start to remove list formatting
    </hp>

    <hh3>Selection Rules</hh3>

    <hp>
      <htext bold>Hard affinity (code):</htext> Use arrow keys around{' '}
      <htext code>code marks</htext> - requires two key presses to cross
      boundaries.
    </hp>

    <hp>
      <htext bold>Directional affinity:</htext> Use arrow keys around{' '}
      <htext superscript>superscript</htext> text - cursor affinity depends on
      movement direction.
    </hp>

    <hp>
      <htext bold>Link directional:</htext> Navigate with arrows around{' '}
      <ha url="https://example.com">this link</ha> to test directional behavior.
    </hp>

    <hh3>Normalize Rules</hh3>

    <hp>
      <htext bold>Empty link removal:</htext> Delete all text from{' '}
      <ha url="https://example.com">this link</ha> - the link element will be
      automatically removed.
    </hp>

    <hh3>Merge Rules</hh3>

    <hp>
      <htext bold>Void elements:</htext>
    </hp>
    <element type="hr" />
    <hp>
      Press Backspace at start - void element are selected rather than deleted.
    </hp>

    <hp>
      <text />
    </hp>
    <hh2>Backspace at start removes empty paragraph above</hh2>
  </fragment>
);
