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
              <htext bold>插件</htext>
            </hp>
          </hth>
        </htr>
      ) : (
        <htr>
          <hth>
            <hp>
              <htext bold>插件</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>元素</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>内联</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>空元素</htext>
            </hp>
          </hth>
        </htr>
      )}

      <htr>
        <htd>
          <hp>
            <htext bold>标题</htext>
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
          <hp>否</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>图片</htext>
          </hp>
        </htd>
        <htd>
          <hp>是</hp>
        </htd>
        <htd>
          <hp>否</hp>
        </htd>
        <htd>
          <hp>是</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>提及</htext>
          </hp>
        </htd>
        <htd>
          <hp>是</hp>
        </htd>
        <htd>
          <hp>是</hp>
        </htd>
        <htd>
          <hp>是</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const tableValue: any = (
  <fragment>
    <hh2>表格</hh2>
    <hp>
      创建可自定义的表格，具有可调整大小的列和行，让您能够设计结构化布局。
    </hp>
    {createTable()}
  </fragment>
);

export const tableMergeValue: any = (
  <fragment>
    <hh3>表格合并</hh3>
    <hp>
      您可以使用 <htext code>enableMerging: true</htext>{' '}
      选项启用合并功能。试试看：
    </hp>
    {createTable(true)}
  </fragment>
);
