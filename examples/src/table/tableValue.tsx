/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createTable = (): any => (
  <fragment>
    <htable>
      <htr>
        <htd>
          <hp>
            <htext />
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Human</htext>
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Dog</htext>
          </hp>
        </htd>
        <htd>
          <hp>
            <htext bold>Cat</htext>
          </hp>
        </htd>
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
const attributes = { colspan: '2' };
export const createSpanningTable = (): any => (
  <fragment>
    <htable>
      <htr>
        <hth attributes={attributes}>
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
