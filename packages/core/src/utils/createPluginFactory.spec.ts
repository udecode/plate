import { createBasicElementsPlugin } from '../../../elements/basic-elements/src/createBasicElementPlugins';
import { createPluginFactory } from './createPluginFactory';

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
});
