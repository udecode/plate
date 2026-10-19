/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const dndTableValue: Value = (
  <fragment>
    <hheading level={2}>Tables and columns</hheading>
    <hp>
      Drag a row by its handle to reorder the table. Rows land only beside rows
      of the same table, and a paragraph can drop into a cell.
    </hp>
    <htable columnWidths={[160, 160, 160]}>
      <htr>
        <hth>
          <hp>
            <htext bold>Task</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Owner</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Status</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>Write the spec</hp>
        </htd>
        <htd>
          <hp>Ada</hp>
        </htd>
        <htd>
          <hp>Done</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>Build the editor</hp>
        </htd>
        <htd>
          <hp>Grace</hp>
        </htd>
        <htd>
          <hp>In progress</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>Ship it</hp>
        </htd>
        <htd>
          <hp>Linus</hp>
        </htd>
        <htd>
          <hp>Planned</hp>
        </htd>
      </htr>
    </htable>
    <hp>
      Drag a column by its handle to reorder the layout, or drag a block inside
      a column into the other column or out of the layout.
    </hp>
    <hcolumngroup>
      <hcolumn width="50%">
        <hp>Left one</hp>
        <hp>Left two</hp>
      </hcolumn>
      <hcolumn width="50%">
        <hp>Right one</hp>
        <hp>Right two</hp>
      </hcolumn>
    </hcolumngroup>
    <hp>Drop blocks here, below the layout.</hp>
  </fragment>
);
