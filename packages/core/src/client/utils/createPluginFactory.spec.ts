import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { ELEMENT_LINK, createLinkPlugin } from '@udecode/plate-link';

import { createPluginFactory, getPlugin } from '../../shared';
import { createPlateEditor } from './createPlateEditor';

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
      const { inject, key, type } = createPlugin({
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
        type: 'b',
      });

      expect({ inject, key, type }).toEqual({
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
        key: 'a',
        type: 'b',
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
              getNode: () => ({ test: true }),
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
            plugins: [
              {
                key: 'aa',
                type: 'aa',
              },
            ],
            then: () => ({
              plugins: [
                {
                  key: 'bb',
                  then: () => ({
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
                    type: 'athen2',
                  }),
                  type: 'bb',
                },
              ],
              type: 'athen',
            }),
            type: 'a',
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
