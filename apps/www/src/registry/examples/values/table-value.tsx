/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const createTable = (spanning?: boolean) => {
  const id = spanning ? 'table-merge-demo' : 'table-demo';

  return (
    <fragment>
      <htable
        id={`${id}-table`}
        columnWidths={[100, 100, 100, 100]}
        marginLeft={20}
      >
        {spanning ? (
          <htr id={`${id}-header-row`}>
            <hth id={`${id}-header-plugin`} colSpan={4}>
              <hp id={`${id}-header-plugin-content`}>
                <htext bold>Plugin</htext>
              </hp>
            </hth>
          </htr>
        ) : (
          <htr id={`${id}-header-row`}>
            <hth id={`${id}-header-plugin`}>
              <hp id={`${id}-header-plugin-content`}>
                <htext bold>Plugin</htext>
              </hp>
            </hth>
            <hth id={`${id}-header-element`}>
              <hp id={`${id}-header-element-content`}>
                <htext bold>Element</htext>
              </hp>
            </hth>
            <hth id={`${id}-header-inline`}>
              <hp id={`${id}-header-inline-content`}>
                <htext bold>Inline</htext>
              </hp>
            </hth>
            <hth id={`${id}-header-void`}>
              <hp id={`${id}-header-void-content`}>
                <htext bold>Void</htext>
              </hp>
            </hth>
          </htr>
        )}

        <htr id={`${id}-heading-row`}>
          <htd id={`${id}-heading-name`}>
            <hp id={`${id}-heading-name-content`}>
              <htext bold>Heading</htext>
            </hp>
          </htd>
          <htd id={`${id}-heading-element`}>
            <hp id={`${id}-heading-element-content`}>
              <htext />
            </hp>
          </htd>
          <htd id={`${id}-heading-inline`}>
            <hp id={`${id}-heading-inline-content`}>
              <htext />
            </hp>
          </htd>
          <htd id={`${id}-heading-void`}>
            <hp id={`${id}-heading-void-content`}>No</hp>
          </htd>
        </htr>
        <htr id={`${id}-image-row`}>
          <htd id={`${id}-image-name`}>
            <hp id={`${id}-image-name-content`}>
              <htext bold>Image</htext>
            </hp>
          </htd>
          <htd id={`${id}-image-element`}>
            <hp id={`${id}-image-element-content`}>Yes</hp>
          </htd>
          <htd id={`${id}-image-inline`}>
            <hp id={`${id}-image-inline-content`}>No</hp>
          </htd>
          <htd id={`${id}-image-void`}>
            <hp id={`${id}-image-void-content`}>Yes</hp>
          </htd>
        </htr>
        <htr id={`${id}-mention-row`}>
          <htd id={`${id}-mention-name`}>
            <hp id={`${id}-mention-name-content`}>
              <htext bold>Mention</htext>
            </hp>
          </htd>
          <htd id={`${id}-mention-element`}>
            <hp id={`${id}-mention-element-content`}>Yes</hp>
          </htd>
          <htd id={`${id}-mention-inline`}>
            <hp id={`${id}-mention-inline-content`}>Yes</hp>
          </htd>
          <htd id={`${id}-mention-void`}>
            <hp id={`${id}-mention-void-content`}>Yes</hp>
          </htd>
        </htr>
      </htable>
    </fragment>
  );
};

export const tableValue = (
  <fragment>
    <hheading level={2} id="table-demo-heading">
      Table
    </hheading>
    <hp id="table-demo-description">
      Create customizable tables with resizable columns and rows, allowing you
      to design structured layouts.
    </hp>
    {createTable()}
  </fragment>
);

export const tableMergeValue = (
  <fragment>
    <hheading level={3} id="table-merge-demo-heading">
      Table Merge
    </hheading>
    <hp id="table-merge-demo-description">
      You can disable merging using <htext code>disableMerge: true</htext>{' '}
      option. Try it out:
    </hp>
    {createTable(true)}
  </fragment>
);
