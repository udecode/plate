import type { PlatePlugin } from '@udecode/plate-common';

import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createTEditor } from '@udecode/slate';

import { getPlugin } from '../../../common/utils';
import { KEY_DESERIALIZE_AST } from '../../plugins/createDeserializeAstPlugin';
import { KEY_EDITOR_PROTOCOL } from '../../plugins/createEditorProtocolPlugin';
import { KEY_INLINE_VOID } from '../../plugins/createInlineVoidPlugin';
import { KEY_INSERT_DATA } from '../../plugins/createInsertDataPlugin';
import { KEY_NODE_FACTORY } from '../../plugins/createNodeFactoryPlugin';
import { KEY_PREV_SELECTION } from '../../plugins/createPrevSelectionPlugin';
import { KEY_EVENT_EDITOR } from '../../plugins/event-editor/createEventEditorPlugin';
import { KEY_DESERIALIZE_HTML } from '../../plugins/html-deserializer/createDeserializeHtmlPlugin';
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
        inject: {
          props: {
            nodeKey: 'a',
          },
        },
        key: 'a',
        then: (editor, { type }) => ({
          inject: {
            props: {
              nodeKey: `${type}b`,
            },
          },
          then: (e, { type: _type }) => ({
            inject: {
              props: {
                nodeKey: `${_type}c`,
              },
            },
            type: `${_type}c`,
          }),
          type: `${type}b`,
        }),
        type: 'a',
      };

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
