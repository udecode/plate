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
      const { key, type, overrideProps } = createPlugin({
        type: 'b',
        overrideProps: {
          nodeKey: 'b',
        },
      });

      expect({ key, type, overrideProps }).toEqual({
        key: 'a',
        type: 'b',
        overrideProps: {
          nodeKey: 'b',
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
            levels: 5,
          },
        }
      );

      const { key, levels } = plugin.plugins![2];

      expect({ key, levels }).toEqual({
        key: 'h',
        levels: 5,
      });
    });
  });
});
