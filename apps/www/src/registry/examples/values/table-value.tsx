/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const createTable = (spanning?: boolean) => (
  <fragment>
    <htable columnWidths={[100, 100, 100, 100]} marginLeft={20}>
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
          <hp>
            <htext />
          </hp>
        </htd>
        <htd>
          <hp>
            <htext />
          </hp>
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

export const tableValue: Value = (
  <fragment>
    <hheading level={2}>Table</hheading>
    <hp>
      Create customizable tables with resizable columns and rows, allowing you
      to design structured layouts.
    </hp>
    {createTable()}
  </fragment>
);

export const tableMergeValue = (
  <fragment>
    <hheading level={3}>Table Merge</hheading>
    <hp>
      You can disable merging using <htext code>disableMerge: true</htext>{' '}
      option. Try it out:
    </hp>
    {createTable(true)}
  </fragment>
);
