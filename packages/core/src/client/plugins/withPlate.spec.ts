import type { PlatePlugin } from '@udecode/plate-common';

import { HeadingPlugin } from '@udecode/plate-heading';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { createTEditor } from '@udecode/slate';

import {
  KEY_DESERIALIZE_AST,
  KEY_DESERIALIZE_HTML,
  KEY_EDITOR_PROTOCOL,
  KEY_EVENT_EDITOR,
  KEY_INLINE_VOID,
  KEY_INSERT_DATA,
  KEY_NODE_FACTORY,
  KEY_PREV_SELECTION,
  createPlugin,
  getPlugin,
} from '../../shared';
import { withPlate } from './withPlate';

const coreKeys = [
  'react',
  'history',
  KEY_NODE_FACTORY,
  KEY_EVENT_EDITOR,
  KEY_INLINE_VOID,
  KEY_INSERT_DATA,
  KEY_PREV_SELECTION,
  KEY_DESERIALIZE_HTML,
  KEY_DESERIALIZE_AST,
  KEY_EDITOR_PROTOCOL,
];

describe('withPlate', () => {
  describe('when default plugins', () => {
    it('should be', () => {
      const editor = withPlate(createTEditor(), { id: '1' });

      expect(editor.id).toBe('1');
      expect(editor.history).toBeDefined();
      expect(editor.key).toBeDefined();
      expect(editor.plugins.map((plugin) => plugin.key)).toEqual(coreKeys);
      expect(editor.plugins.map((plugin) => plugin.type)).toEqual(coreKeys);
      expect(Object.keys(editor.pluginsByKey)).toEqual(coreKeys);
    });
  });

  describe('when same plugin with different keys', () => {
    it('should be', () => {
      const pluginP: PlatePlugin = ParagraphPlugin;
      const pluginA: PlatePlugin = ParagraphPlugin.extend({ key: 'a' });
      const pluginB = HeadingPlugin.configure({
        levels: 2,
      }).extendPlugin('h1', {
        key: 'hh1',
      });

      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [pluginP, pluginA, pluginB],
      });

      const keys = [...coreKeys, 'p', 'a', 'heading', 'hh1', 'h2'];

      expect(Object.keys(editor.pluginsByKey)).toEqual(keys);
    });
  });

  describe('when it has many extend', () => {
    it('should deep merge', () => {
      const pluginInput: PlatePlugin = createPlugin({
        inject: {
          props: {
            nodeKey: 'a',
          },
        },
        key: 'a',
        type: 'a',
      })
        .extend((_, { type }) => ({
          inject: {
            props: {
              nodeKey: `${type}b`,
            },
          },
          type: `${type}b`,
        }))
        .extend((_, { type: _type }) => ({
          inject: {
            props: {
              nodeKey: `${_type}c`,
            },
          },
          type: `${_type}c`,
        }));

      const plugins = [pluginInput];

      const editor = withPlate(createTEditor(), { id: '1', plugins });

      const { inject, type } = getPlugin(editor, 'a');

      expect({ inject, type }).toEqual({
        inject: {
          props: {
            nodeKey: 'abc',
          },
        },
        type: 'abc',
      });
    });
  });

  describe('when extendPlugin', () => {
    it('should concat the plugins', () => {
      const pluginAA: PlatePlugin = createPlugin({
        key: 'aa',
        type: 'aa',
      });

      const pluginAB1: PlatePlugin = createPlugin({
        key: 'ab',
        type: 'ab1',
      });
      const pluginAB2: PlatePlugin = createPlugin({
        key: 'ab',
        type: 'ab2',
      });

      const pluginAC: PlatePlugin = createPlugin({
        key: 'ac',
        type: 'ac',
      });
      const pluginAD: PlatePlugin = createPlugin({
        key: 'ad',
        type: 'ad',
      });

      const pluginA: PlatePlugin = createPlugin({
        key: 'a',
        plugins: [pluginAA, pluginAB1],
      })
        .extendPlugin(pluginAB2.key, pluginAB2)
        .extendPlugin(pluginAC.key, pluginAC)
        .extendPlugin(pluginAD.key, pluginAD);

      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [pluginA],
      });

      const outputPluginAA = getPlugin(editor, 'aa');
      const outputPluginAB = getPlugin(editor, 'ab');
      const outputPluginAC = getPlugin(editor, 'ac');
      const outputPluginAD = getPlugin(editor, 'ad');

      expect([
        {
          key: outputPluginAA.key,
          type: outputPluginAA.type,
        },
        {
          key: outputPluginAB.key,
          type: outputPluginAB.type,
        },
        {
          key: outputPluginAC.key,
          type: outputPluginAC.type,
        },
        {
          key: outputPluginAD.key,
          type: outputPluginAD.type,
        },
      ]).toEqual([
        { key: pluginAA.key, type: pluginAA.type },
        { key: pluginAB2.key, type: pluginAB2.type },
        { key: pluginAC.key, type: pluginAC.type },
        { key: pluginAD.key, type: pluginAD.type },
      ]);
    });
  });

  describe('when extend in nested plugins', () => {
    it('should deep merge the plugins', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
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
              type: 'bb',
            })
            .extendPlugin('aa', {
              type: 'ab',
            })
            .extendPlugin('cc', {
              type: 'cc',
            })
            .extendPlugin('bb', {
              type: 'athen2',
            }),
        ],
      });

      const a = getPlugin(editor, 'a');
      const aa = getPlugin(editor, 'aa');
      const bb = getPlugin(editor, 'bb');
      const cc = getPlugin(editor, 'cc');

      expect({
        type: a.type,
      }).toEqual({ type: 'athen' });
      expect({
        type: aa.type,
      }).toEqual({ type: 'ab' });
      expect({
        type: bb.type,
      }).toEqual({ type: 'athen2' });
      expect({
        type: cc.type,
      }).toEqual({ type: 'cc' });
    });
  });

  describe('when plugin has overridesByKey', () => {
    it('should be', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [
          createPlugin({
            key: 'a',
            overrideByKey: {
              a: {
                type: 'a1',
              },
              aa: {
                type: 'aa1',
              },
              cc: {
                type: 'cc1',
              },
            },
            plugins: [
              createPlugin({
                key: 'aa',
                type: 'aa',
              }),
            ],
            type: 'a',
          }).extend({
            plugins: [
              createPlugin({
                key: 'bb',
                type: 'bb',
              }).extend({
                plugins: [
                  createPlugin({
                    key: 'aa',
                    type: 'ab',
                  }),
                  createPlugin({
                    key: 'cc',
                    type: 'cc',
                  }),
                ],
                type: 'athen2',
              }),
            ],
            type: 'athen',
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
      }).toEqual({ type: 'athen2' });
      expect({
        type: cc.type,
      }).toEqual({ type: 'cc1' });
    });
  });
});
