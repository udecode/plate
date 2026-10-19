/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
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
      Nearest structure – A code block, callout, image or divider stays in its
      container; any other block leaves the container
    </hp>

    <hp>Exit breaks work in nested structures like tables and columns:</hp>
    <hcolumngroup>
      <hcolumn width="50%">{createTable()}</hcolumn>
      <hcolumn width="50%">
        <hcodeblock>Try ⌘⏎ to exit this code block.</hcodeblock>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
