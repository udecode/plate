import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { ELEMENT_LINK, createLinkPlugin } from '@udecode/plate-link';

import { createPlugin, getPlugin } from '../../shared';
import { createPlateEditor } from './createPlateEditor';

describe('createPlugin', () => {
  const basePlugin = createPlugin({ key: 'a', type: 'a' });

  describe('when no overrides', () => {
    it('should be', () => {
      const { key, type } = basePlugin;

      expect({ key, type }).toEqual({ key: 'a', type: 'a' });
    });
  });

  describe('when overriding', () => {
    it('should be', () => {
      const plugin = basePlugin.extend({
        inject: {
          props: {
            nodeKey: 'b',
          },
        },
        type: 'b',
      });

      expect({ inject: plugin.inject, key: plugin.key, type: plugin.type }).toEqual({
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
      const plugin = createBasicElementsPlugin().extendPlugin('heading', {
        key: 'h',
        options: {
          levels: 5,
        },
      });

      const headingPlugin = plugin.plugins!.find(p => p.key === 'h');
      const { key, options } = headingPlugin!;

      expect({ key, options }).toEqual({
        key: 'h',
        options: {
          levels: 5,
        },
      });
    });
  });

  describe('when default plugin has extend and we override a function at the root', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createLinkPlugin().extend({
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

  describe('when both plugin and overrides have extend and plugins', () => {
    it('should be', () => {
      const editor = createPlateEditor({
        plugins: [
          createPlugin({
            key: 'a',
            plugins: [
              {
                key: 'aa',
                type: 'aa',
              },
            ],
            type: 'a',
          }).extend((editor, p) => ({
            plugins: [
              {
                key: 'bb',
                type: 'bb',
              },
            ],
            type: 'athen',
          })).extend((editor, p) => ({
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
          })).extend({
            type: 'a1',
          }).extendPlugin('aa', {
            type: 'aa1',
          }).extendPlugin('cc', {
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