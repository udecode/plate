export const autoformatValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const autoformatValue: any = (
  <fragment>
    <hh1>🏃‍♀️ Autoformat</hh1>
    <hp>
      The editor gives you full control over the logic you can add. For example,
      it's fairly common to want to add markdown-like shortcuts to editors.
    </hp>
    <hp>While typing, try these (mark rules):</hp>
    <hul>
      <hli>
        <hlic>
          Type <htext code>**</htext> or <htext code>__</htext> on either side
          of your text to add **bold* mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>*</htext> or <htext code>_</htext> on either side of
          your text to add *italic mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>\`</htext> on either side of your text to add \`inline
          code mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>~~</htext> on either side of your text to add
          ~~strikethrough~ mark.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Note that nothing happens when there is a character before, try
          on:*bold
        </hlic>
      </hli>
      <hli>
        <hlic>
          We even support smart quotes, try typing{' '}
          <htext code>"hello" 'world'</htext>.
        </hlic>
      </hli>
    </hul>
    <hp>
      At the beginning of any new block or existing block, try these (block
      rules):
    </hp>
    <hul>
      <hli>
        <hlic>
          Type <htext code>*</htext>, <htext code>-</htext> or{' '}
          <htext code>+</htext>
          followed by <htext code>space</htext> to create a bulleted list.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>1.</htext> or <htext code>1)</htext> followed by{' '}
          <htext code>space</htext>
          to create a numbered list.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>&gt;</htext> followed by <htext code>space</htext> to
          create a block quote.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>\`\`\`</htext> to create a code block.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>---</htext> to create a horizontal rule.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>#</htext> followed by <htext code>space</htext> to
          create an H1 heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>##</htext> followed by <htext code>space</htext> to
          create an H2 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>###</htext> followed by <htext code>space</htext> to
          create an H3 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>####</htext> followed by <htext code>space</htext> to
          create an H4 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>#####</htext> followed by <htext code>space</htext>{' '}
          to create an H5 sub-heading.
        </hlic>
      </hli>
      <hli>
        <hlic>
          Type <htext code>######</htext> followed by <htext code>space</htext>{' '}
          to create an H6 sub-heading.
        </hlic>
      </hli>
    </hul>
  </fragment>
);
`;

export const autoformatValueFile = {
  '/autoformat/autoformatValue.tsx': autoformatValueCode,
};
