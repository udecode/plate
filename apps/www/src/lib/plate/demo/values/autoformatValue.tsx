/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const autoformatValue: any = (
  <fragment>
    <hh2>🏃‍♀️ Autoformat</hh2>
    <hp>
      Empower your writing experience by enabling autoformatting features. Add
      Markdown-like shortcuts that automatically apply formatting as you type.
    </hp>
    <hp>While typing, try these mark rules:</hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>**</htext> or <htext code>__</htext> on either side of
      your text to add **bold* mark.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>*</htext> or <htext code>_</htext> on either side of your
      text to add *italic mark.
    </hp>

    <hp indent={1} listStyleType="disc">
      Type <htext code>`</htext> on either side of your text to add `inline code
      mark.
    </hp>

    <hp indent={1} listStyleType="disc">
      Type <htext code>~~</htext> on either side of your text to add
      ~~strikethrough~ mark.
    </hp>
    <hp indent={1} listStyleType="disc">
      Note that nothing happens when there is a character before, try on:*bold
    </hp>
    <hp indent={1} listStyleType="disc">
      We even support smart quotes, try typing{' '}
      <htext code>"hello" 'world'</htext>.
    </hp>

    <hp>
      At the beginning of any new block or existing block, try these (block
      rules):
    </hp>

    <hp indent={1} listStyleType="disc">
      Type <htext code>*</htext>, <htext code>-</htext> or <htext code>+</htext>
      followed by <htext code>space</htext> to create a bulleted list.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>1.</htext> or <htext code>1)</htext> followed by{' '}
      <htext code>space</htext>
      to create a numbered list.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>[]</htext>,or <htext code>[x]</htext>
      followed by <htext code>space</htext> to create a todo list.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>&gt;</htext> followed by <htext code>space</htext> to
      create a block quote.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>```</htext> to create a code block.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>---</htext> to create a horizontal rule.
    </hp>

    <hp indent={1} listStyleType="disc">
      Type <htext code>#</htext> followed by <htext code>space</htext> to create
      an H1 heading.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>###</htext> followed by <htext code>space</htext> to
      create an H3 sub-heading.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>####</htext> followed by <htext code>space</htext> to
      create an H4 sub-heading.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>#####</htext> followed by <htext code>space</htext> to
      create an H5 sub-heading.
    </hp>
    <hp indent={1} listStyleType="disc">
      Type <htext code>######</htext> followed by <htext code>space</htext> to
      create an H6 sub-heading.
    </hp>
  </fragment>
);
