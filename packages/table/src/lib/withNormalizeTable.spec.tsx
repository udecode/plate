/** @jsx jsxt */

import { type Value, createSlateEditor } from '@udecode/plate';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { jsxt } from '@udecode/plate-test-utils';

import { type TableConfig, BaseTablePlugin } from './BaseTablePlugin';

jsxt;

export const getTestTablePlugins = (
  options?: Partial<TableConfig['options']>,
  override?: (plugin: typeof BaseTablePlugin) => any
) => {
  let tablePlugin = BaseTablePlugin.configure({
    options: {
      disableMerge: true,
      ...options,
    },
  });

  if (override) {
    tablePlugin = override(tablePlugin);
  }

  return [NodeIdPlugin, tablePlugin];
};

describe('withNormalizeTable', () => {
  // https://github.com/udecode/editor-protocol/issues/65
  describe('cell child is a text', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should wrap the children into a p (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <htext>a</htext>
                  <htext bold>b</htext>
                  <htext italic>c</htext>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const output = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext>a</htext>
                    <htext bold>b</htext>
                    <htext italic>c</htext>
                  </hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const editor = createSlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          value: input,
        });

        editor.tf.normalize({
          force: true,
        });
        expect(editor.children).toMatchObject(output);
      }
    );
  });

  describe('initialTableWidth is defined and colSizes is not defined', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should set colSizes (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const output = (
          <fragment>
            <htable colSizes={[30, 30, 30]}>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const editor = createSlateEditor({
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 90,
          }),
          value: input,
        });

        editor.tf.normalize({
          force: true,
        });
        expect(editor.children).toMatchObject(output);
      }
    );
  });

  describe('initialTableWidth is defined and colSizes is partially defined', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should set colSizes (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <fragment>
            <htable colSizes={[0, 40, 0]}>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const output = (
          <fragment>
            <htable colSizes={[30, 40, 30]}>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const editor = createSlateEditor({
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 90,
          }),
          value: input,
        });

        editor.tf.normalize({
          force: true,
        });
        expect(editor.children).toMatchObject(output);
      }
    );
  });

  describe('initialTableWidth is defined and colSizes is fully defined', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should do nothing (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <fragment>
            <htable colSizes={[40, 40, 40]}>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const output = (
          <fragment>
            <htable colSizes={[40, 40, 40]}>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const editor = createSlateEditor({
          plugins: getTestTablePlugins({
            disableMerge,
            initialTableWidth: 90,
          }),
          value: input,
        });

        editor.tf.normalize({
          force: true,
        });
        expect(editor.children).toMatchObject(output);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/76
  describe('table in a table', () => {
    it.each([{ disableMerge: true }, { disableMerge: false }])(
      'should unwrap the nested table, tr, td (disableMerge: $disableMerge)',
      ({ disableMerge }) => {
        const input = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                  <htable>
                    <htr>
                      <htd>
                        <hp>b</hp>
                      </htd>
                      <htd>
                        <hp>c</hp>
                      </htd>
                    </htr>
                  </htable>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const output = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                  <hp>b</hp>
                  <hp>c</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as any as Value;

        const editor = createSlateEditor({
          plugins: getTestTablePlugins({ disableMerge }),
          value: input,
        });

        editor.tf.normalize({
          force: true,
        });
        expect(editor.children).toMatchObject(output);
      }
    );
  });
});
