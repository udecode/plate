/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

import { createTable } from './table-value';

jsx;

export const trailingBlockValue: any = (
  <fragment>
    <hh2>Trailing Block</hh2>
    <hp>Always have a trailing paragraph at the end of your editor.</hp>
  </fragment>
);

export const exitBreakValue: any = (
  <fragment>
    <hh2>Exit Break</hh2>
    <hp>
      Exit from nested block structures using keyboard shortcuts. The plugin
      automatically determines the appropriate exit point:
    </hp>

    <hp indent={1} listStyleType="disc">
      ⌘⏎ – Exit and insert a new block after the current structure
    </hp>
    <hp indent={1} listStyleType="disc">
      ⌘⇧⏎ – Exit and insert a new block before the current structure
    </hp>
    <hp indent={1} listStyleType="disc">
      Automatic – Finds the nearest ancestor that allows paragraph siblings
    </hp>

    <hp>Exit breaks work intelligently in nested structures like tables:</hp>
    <hcolumngroup layout={[50, 50]}>
      <hcolumn width="50%">{createTable()}</hcolumn>
      <hcolumn width="50%">
        <hcodeblock>
          <hcodeline>Try ⌘⏎ to exit this code block.</hcodeline>
        </hcodeblock>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
