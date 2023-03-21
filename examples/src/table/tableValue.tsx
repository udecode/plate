/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createTable = (): any => (
  <fragment>
    <htable colSizes={[150, 150, 150, 150]}>
      <htr>
        <hth>
          <hp>
            <htext />
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Human</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Dog</htext>
          </hp>
        </hth>
        <hth>
          <hp>
            <htext bold>Cat</htext>
          </hp>
        </hth>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold># of Feet</htext>
          </hp>
        </htd>
        <htd>
          <hp>2</hp>
        </htd>
        <htd>
          <hp>4</hp>
        </htd>
        <htd>
          <hp>4</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold># of Lives</htext>
          </hp>
        </htd>
        <htd>
          <hp>1</hp>
        </htd>
        <htd>
          <hp>1</hp>
        </htd>
        <htd>
          <hp>9</hp>
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

export const tableValue: any = (
  <fragment>
    <hh2>🏓 Table</hh2>
    <hp>
      Since the editor is based on a recursive tree model, similar to an HTML
      document, you can create complex nested structures, like tables:
    </hp>
    {createTable()}
    <hp>
      This table is an example of rendering a table spanning multiple columns:
    </hp>
    {createSpanningTable()}
  </fragment>
);
