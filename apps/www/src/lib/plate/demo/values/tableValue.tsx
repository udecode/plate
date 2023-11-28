/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createTable = (spanning?: boolean): any => (
  <fragment>
    <htable colSizes={[100, 100, 100, 100]} marginLeft={20}>
      {spanning ? (
        <htr>
          <hth colSpan={4}>
            <hp>
              <htext bold>Plugin</htext>
            </hp>
          </hth>
        </htr>
      ) : (
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
      )}

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

export const tableValue: any = (
  <fragment>
    <hh2>🏓 Table</hh2>
    <hp>
      Create customizable tables with resizable columns and rows, allowing you
      to design structured layouts.
    </hp>
    {createTable()}
  </fragment>
);

export const tableMergeValue: any = (
  <fragment>
    <hh3>Table Merge</hh3>
    <hp>
      You can enable merging using <htext code>enableMerging: true</htext>{' '}
      option. Try it out:
    </hp>
    {createTable(true)}
  </fragment>
);
