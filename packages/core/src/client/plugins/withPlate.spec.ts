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
  type PlatePlugin,
  createPlugin,
  getPlugin,
} from '../../shared';
import { withPlate } from './withPlate';

const coreKeys = [
  'editor',
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

  describe('when extending nested plugins', () => {
    it('should correctly merge and extend nested plugins', () => {
      const editor = withPlate(createTEditor(), {
        id: '1',
        plugins: [
          createPlugin({
            key: 'parent',
            plugins: [
              createPlugin({
                key: 'child',
                type: 'childOriginal',
              }),
            ],
            type: 'parentOriginal',
          })
            .extend({
              type: 'parentExtended',
            })
            .extendPlugin('child', {
              type: 'childExtended',
            })
            .extendPlugin('newChild', {
              type: 'newChildType',
            }),
        ],
      });

      const parent = getPlugin(editor, 'parent');
      const child = getPlugin(editor, 'child');
      const newChild = getPlugin(editor, 'newChild');

      expect(parent.type).toBe('parentExtended');
      expect(child.type).toBe('childExtended');
      expect(newChild.type).toBe('newChildType');
    });
  });
});
