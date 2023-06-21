import { createHeadingPlugin } from '@udecode/plate-heading/src/createHeadingPlugin';
import { createParagraphPlugin } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { createTEditor } from '@udecode/slate/src/createTEditor';
import { KEY_DESERIALIZE_HTML } from './html-deserializer/createDeserializeHtmlPlugin';
import { KEY_DESERIALIZE_AST } from './createDeserializeAstPlugin';
import { KEY_EDITOR_PROTOCOL } from './createEditorProtocolPlugin';
import { KEY_EVENT_EDITOR } from './createEventEditorPlugin';
import { KEY_INLINE_VOID } from './createInlineVoidPlugin';
import { KEY_INSERT_DATA } from './createInsertDataPlugin';
import { KEY_NODE_FACTORY } from './createNodeFactoryPlugin';
import { KEY_PREV_SELECTION } from './createPrevSelectionPlugin';
import { withPlate } from './withPlate';

import { PlatePlugin } from '@/packages/core/src/types/plugin/PlatePlugin';
import { getPlugin } from '@/packages/core/src/utils/getPlugin';

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
      const pluginP: PlatePlugin = createParagraphPlugin();
      const pluginA: PlatePlugin = createParagraphPlugin({ key: 'a' });
      const pluginB: PlatePlugin = createHeadingPlugin(
        { options: { levels: 2 } },
        {
          h1: {
            key: 'hh1',
          },
        }
      );

      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [pluginP, pluginA, pluginB],
      });

      const keys = [...coreKeys, 'p', 'a', 'heading', 'hh1', 'h2'];

      expect(Object.keys(editor.pluginsByKey)).toEqual(keys);
    });
  });

  describe('when it has recursive then', () => {
    it('should deep merge', () => {
      const pluginInput: PlatePlugin = {
        key: 'a',
        type: 'a',
        inject: {
          props: {
            nodeKey: 'a',
          },
        },
        then: (editor, { type }) => ({
          type: `${type}b`,
          inject: {
            props: {
              nodeKey: `${type}b`,
            },
          },
          then: (e, { type: _type }) => ({
            type: `${_type}c`,
            inject: {
              props: {
                nodeKey: `${_type}c`,
              },
            },
          }),
        }),
      };

      const plugins = [pluginInput];

      const editor = withPlate(createTEditor(), { id: '1', plugins });

      const { type, inject } = getPlugin(editor, 'a');

      expect({ type, inject }).toEqual({
        type: 'abc',
        inject: {
          props: {
            nodeKey: 'abc',
          },
        },
      });
    });
  });

  describe('when then with nested plugins', () => {
    it('should deep merge the plugins', () => {
      const pluginAA: PlatePlugin = {
        key: 'aa',
        type: 'aa',
      };

      const pluginAB1: PlatePlugin = {
        key: 'ab',
        type: 'ab1',
      };
      const pluginAB2: PlatePlugin = {
        key: 'ab',
        type: 'ab2',
      };

      const pluginAC: PlatePlugin = {
        key: 'ac',
        type: 'ac',
      };
      const pluginAD: PlatePlugin = {
        key: 'ad',
        type: 'ad',
      };

      const pluginA: PlatePlugin = {
        key: 'a',
        plugins: [pluginAA, pluginAB1],
        then: () => ({
          plugins: [pluginAB2, pluginAC],
          then: () => ({
            plugins: [pluginAD],
          }),
        }),
      };

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

  describe('when then in nested plugins', () => {
    it('should deep merge the plugins', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [
          {
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
          },
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
          {
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
          },
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
