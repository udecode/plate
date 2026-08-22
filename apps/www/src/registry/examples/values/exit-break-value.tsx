/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

import { createTable } from './table-value';

jsx;

export const trailingBlockValue: Value = (
  <fragment>
    <hheading level={2}>Trailing Block</hheading>
    <hp>Always have a trailing paragraph at the end of your editor.</hp>
  </fragment>
);

export const exitBreakValue: Value = (
  <fragment>
    <hheading level={2}>Exit Break</hheading>
    <hp>
      Exit from nested block structures using keyboard shortcuts. The plugin
      automatically determines the appropriate exit point:
    </hp>

    <hp indent={1} listType="bulleted">
      ⌘⏎ – Exit and insert a new block after the current structure
    </hp>
    <hp indent={1} listType="bulleted">
      ⌘⇧⏎ – Exit and insert a new block before the current structure
    </hp>
    <hp indent={1} listType="bulleted">
      Automatic – Finds the nearest ancestor that allows paragraph siblings
    </hp>

    <hp>Exit breaks work intelligently in nested structures like tables:</hp>
    <hcolumngroup>
      <hcolumn width="50%">{createTable()}</hcolumn>
      <hcolumn width="50%">
        <hcodeblock>
          <hcodeline>Try ⌘⏎ to exit this code block.</hcodeline>
        </hcodeblock>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
