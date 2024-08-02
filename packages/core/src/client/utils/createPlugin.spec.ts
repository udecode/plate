import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { ELEMENT_LINK, LinkPlugin } from '@udecode/plate-link';

import { type PlatePlugin, getPlugin, mockPlugin } from '../../server';
import { createPlugin } from '../../shared';
import { createPlateEditor } from './createPlateEditor';

describe('createPlugin', () => {
  const basePlugin = createPlugin({ key: 'a', type: 'a' });

  describe('when no extend', () => {
    it(' should be', () => {
      const { key, type } = basePlugin;

      expect({ key, type }).toEqual({ key: 'a', type: 'a' });
    });
  });

  describe('when extend', () => {
    it('should be', () => {
      const basePlugin = createPlugin({ key: 'a', type: 'a' });

      const plugin = mockPlugin(
        basePlugin.extend({
          inject: {
            props: {
              nodeKey: 'b',
            },
          },
          type: 'b',
        })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.type,
      }).toEqual({
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

  describe('when extendPlugin', () => {
    it('should be', () => {
      const plugin = mockPlugin(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        }).extendPlugin('aa', {
          type: 'aaa',
        })
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when extendPlugin twice', () => {
    it('should be', () => {
      const plugin = mockPlugin(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extendPlugin('aa', {
            type: 'aaa',
          })
          .extendPlugin('aa', {
            type: 'aab',
          })
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extendPlugin nested', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createPlugin({
            key: 'a',
            plugins: [
              createPlugin({
                key: 'aa',
                type: 'aa',
              }).extendPlugin('aaa', {
                a: 1,
                b: 1,
                plugins: [createPlugin({ key: 'bbb', type: 'bbb' })],
                type: 'aaa',
              }),
            ],
            type: 'a',
          })
            .extendPlugin('aaa', {
              b: 2,
              c: 2,
            })
            .extendPlugin('bbb', {
              a: 1,
            }),
        ],
      });

      const plugin = getPlugin(editor, 'aaa');
      const plugin2 = getPlugin(editor, 'bbb');

      expect(plugin.a).toBe(1);
      expect(plugin.b).toBe(2);
      expect(plugin.c).toBe(2);
      expect(plugin2.a).toBe(1);
    });
  });

  describe('when new extendPlugin', () => {
    it('should be', () => {
      const plugin = mockPlugin(
        createPlugin({
          key: 'a',
          type: 'a',
        }).extendPlugin('aa', {
          type: 'aaa',
        })
      );

      expect(plugin.plugins[0].type).toBe('aaa');
    });
  });

  describe('when new extendPlugin twice', () => {
    it('should be', () => {
      const plugin = mockPlugin(
        createPlugin({
          key: 'a',
          type: 'a',
        })
          .extendPlugin('aa', {
            type: 'aaa',
          })
          .extendPlugin('aa', {
            type: 'aab',
          })
      );

      expect(plugin.plugins[0].type).toBe('aab');
    });
  });

  describe('when extend twice', () => {
    it('should be', () => {
      const basePlugin = createPlugin({ key: 'a', type: 'a' });

      const plugin = mockPlugin(
        basePlugin
          .extend({
            inject: {
              props: {
                nodeKey: 'b',
              },
            },
            type: 'b',
          })
          .extend({
            inject: {
              props: {
                nodeKey: 'c',
              },
            },
            type: 'b',
          })
      );

      expect({
        inject: plugin.inject,
        key: plugin.key,
        type: plugin.type,
      }).toEqual({
        inject: {
          props: {
            nodeKey: 'c',
          },
        },
        key: 'a',
        type: 'b',
      });
    });
  });

  describe('when extend plugins', () => {
    it('should be', () => {
      const plugin: PlatePlugin = mockPlugin(
        BasicElementsPlugin.extendPlugin('heading', {
          key: 'h',
          options: {
            levels: 5,
          },
        })
      );

      const headingPlugin = plugin.plugins.find((p) => p.key === 'h');
      const { key, options } = headingPlugin!;

      expect({ key, options }).toEqual({
        key: 'h',
        options: {
          levels: 5,
        },
      });
    });
  });

  describe('when extend + extendPlugin', () => {
    it('should be', () => {
      const plugin: PlatePlugin = mockPlugin(
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
              type: 'aa',
            }),
          ],
          type: 'a',
        })
          .extend({
            type: 'a_extend',
          })
          .extendPlugin('aa', {
            options: {
              levels: 5,
            },
            type: 'aa_extend',
          })
      );

      const headingPlugin = plugin.plugins.find((p) => p.key === 'aa');
      const { options, type } = headingPlugin!;

      expect({ nestedType: type, options, type: plugin.type }).toEqual({
        nestedType: 'aa_extend',
        options: {
          levels: 5,
        },
        type: 'a_extend',
      });
    });
  });

  describe('when default plugin has extend and we override a function at the root', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          LinkPlugin.extend({
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

  describe('when nested plugin + extend + new extendPlugin', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createPlugin({
            key: 'a',
            plugins: [
              createPlugin({
                key: 'aa',
                type: 'aa',
              }),
            ],
            type: 'a',
          })
            .extend({
              type: 'athen',
            })
            .extendPlugin('bb', {
              key: 'bb',
              type: 'bb',
            })
            .extendPlugin('aa', {
              type: 'ab',
            })
            .extendPlugin('cc', {
              key: 'cc',
              type: 'cc',
            })
            .extend({
              type: 'athen2',
            })
            .extend({
              type: 'a1',
            })
            .extendPlugin('aa', {
              type: 'aa1',
            })
            .extendPlugin('cc', {
              type: 'cc1',
            }),
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
      }).toEqual({ type: 'bb' });
      expect({
        type: cc.type,
      }).toEqual({ type: 'cc1' });
    });
  });
});
