/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createTable = (): any => (
  <fragment>
    <htable colSizes={[150, 150, 150, 150]} marginLeft={50}>
      <htr>
        <hth>
          <hp>
            <htext bold>Plugin</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Element</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Inline</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Void</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Heading</htext>
          </hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
        <htd>
          <hp>No</hp>
        </htd>
        <htd>
          <hp>No</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Image</htext>
          </hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
        <htd>
          <hp>No</hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Mention</htext>
          </hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
        <htd>
          <hp>Yes</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const createSpanningTable = (): any => (
  <fragment>
    <htable colSizes={[300, 300]}>
      <htr>
        <hth colSpan={2}>
          <hp>
            <htext bold>Heading</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Cell 1</htext>
          </hp>
        </htd>
        <htd>
          <hp>Cell 2</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const createMergedCellsTable = (): any => (
  <fragment>
    <htable colSizes={[100, 100, 100, 100]}>
      <htr>
        <hth rowSpan={2} colSpan={2}>
          <hp>
            <htext bold>Heading</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Cell 1</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Cell 2</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>Cell 3</hp>
        </htd>
        <htd>
          <hp>Cell 7</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Cell 4</htext>
          </hp>
        </htd>
        <htd>
          <hp>Cell 5</hp>
        </htd>
        <htd>
          <hp>Cell 6</hp>
        </htd>
        <htd>
          <hp>Cell 8</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const tableValue: any = (
  <fragment>
    <hh2>🏓 Table</hh2>
    <hp>
      Create customizable tables with resizable columns and rows, allowing you
      to design structured layouts.
    </hp>
    {createMergedCellsTable()}
    {/* {createTable()} */}
    {/* <hp>
      This table is an example of rendering a table spanning multiple columns:
    </hp>
    {createSpanningTable()} */}
  </fragment>
);
