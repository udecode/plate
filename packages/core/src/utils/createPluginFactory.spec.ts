import { createBasicElementsPlugin } from 'packages/nodes/basic-elements/src/createBasicElementsPlugin';
import { createLinkPlugin, ELEMENT_LINK } from 'packages/nodes/link/src';
import { createPlateEditor } from './createPlateEditor';
import { createPluginFactory } from './createPluginFactory';
import { getPlugin } from './getPlugin';

describe('createPluginFactory', () => {
  const createPlugin = createPluginFactory({ key: 'a', type: 'a' });

  describe('when no overrides', () => {
    it('should be', () => {
      const { key, type } = createPlugin();

      expect({ key, type }).toEqual({ key: 'a', type: 'a' });
    });
  });

  describe('when overriding', () => {
    it('should be', () => {
      const { key, type, inject } = createPlugin({
        type: 'b',
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
      });

      expect({ key, type, inject }).toEqual({
        key: 'a',
        type: 'b',
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
      });
    });
  });

  describe('when overriding plugins', () => {
    it('should be', () => {
      const plugin = createBasicElementsPlugin(
        {},
        {
          heading: {
            key: 'h',
            options: {
              levels: 5,
            },
          },
        }
      );

      const { key, options } = plugin.plugins![2];

      expect({ key, options }).toEqual({
        key: 'h',
        options: {
          levels: 5,
        },
      });
    });
  });

  describe('when default plugin has then and we override a function at the root', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createLinkPlugin({
            deserializeHtml: {
              getNode: (el) => ({ test: true }),
              withoutChildren: true,
            },
          }),
        ],
      });

      const plugin = getPlugin(editor, ELEMENT_LINK);

      expect((plugin.deserializeHtml as any)?.getNode?.({} as any)).toEqual({
        test: true,
      });
      expect((plugin.deserializeHtml as any)?.withoutChildren).toBeTruthy();
    });
  });

  describe('when both plugin and overrides have then and plugins', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createPluginFactory({
            key: 'a',
            type: 'a',
            plugins: [
              {
                key: 'aa',
                type: 'aa',
              },
            ],
            then: () => ({
              type: 'athen',
              plugins: [
                {
                  key: 'bb',
                  type: 'bb',
                  then: () => ({
                    type: 'athen2',
                    plugins: [
                      {
                        key: 'aa',
                        type: 'ab',
                      },
                      {
                        key: 'cc',
                        type: 'cc',
                      },
                    ],
                  }),
                },
              ],
            }),
          })(
            {
              type: 'a1',
            },
            {
              aa: {
                type: 'aa1',
              },
              cc: {
                type: 'cc1',
              },
            }
          ),
        ],
      });

      const a = getPlugin(editor, 'a');
      const aa = getPlugin(editor, 'aa');
      const bb = getPlugin(editor, 'bb');
      const cc = getPlugin(editor, 'cc');

      expect({
        type: a.type,
      }).toEqual({ type: 'a1' });
      expect({
        type: aa.type,
      }).toEqual({ type: 'aa1' });
      expect({
        type: bb.type,
      }).toEqual({ type: 'athen2' });
      expect({
        type: cc.type,
      }).toEqual({ type: 'cc1' });
    });
  });
});
