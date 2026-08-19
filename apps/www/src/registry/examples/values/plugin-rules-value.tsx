/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const pluginRulesValue = (
  <fragment>
    <hheading level={2}>Plugin Rules</hheading>
    <hp>
      Plugin rules control how blocks respond to Enter, Backspace, selection,
      and normalization.
    </hp>

    <hheading level={3}>Break Rules</hheading>

    <hp>
      <htext bold>Heading splitReset:</htext> Press Enter in middle of heading
      to split and reset new block to paragraph.
    </hp>
    <hheading level={3}>
      Press Enter after "Press" to see splitReset behavior
    </hheading>

    <hp>
      <htext bold>Blockquote containers:</htext> Blockquotes wrap nested blocks
      like paragraphs and lists. Enter acts on the inner block.
    </hp>
    <hblockquote>
      <hp>
        Blockquotes are containers now. Split this paragraph or add nested
        blocks inside the quote.
      </hp>
      <hp indent={1} listType="bulleted">
        Quoted list items stay inside the same blockquote container.
      </hp>
      <hblockquote>
        <hp>Nested blockquotes keep reply chains explicit.</hp>
      </hblockquote>
    </hblockquote>

    <hheading level={3}>Delete Rules</hheading>

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
    <hp indent={1} listType="bulleted">
      Press Backspace at start to remove list formatting
    </hp>

    <hheading level={3}>Selection Rules</hheading>

    <hp>
      <htext bold>Hard affinity (code):</htext> Use arrow keys around{' '}
      <htext code>code marks</htext> - requires two key presses to cross
      boundaries.
    </hp>

    <hp>
      <htext bold>Directional affinity:</htext> Use arrow keys around{' '}
      <htext script="sup">superscript</htext> text - cursor affinity depends on
      movement direction.
    </hp>

    <hp>
      <htext bold>Link directional:</htext> Navigate with arrows around{' '}
      <ha url="https://example.com">this link</ha> to test directional behavior.
    </hp>

    <hheading level={3}>Normalize Rules</hheading>

    <hp>
      <htext bold>Empty link removal:</htext> Delete all text from{' '}
      <ha url="https://example.com">this link</ha> - the link element will be
      automatically removed.
    </hp>

    <hheading level={3}>Merge Rules</hheading>

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
    <hheading level={2}>
      Backspace at start removes empty paragraph above
    </hheading>
  </fragment>
);
