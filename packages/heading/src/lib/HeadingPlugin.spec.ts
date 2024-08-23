import { createPlateEditor } from '@udecode/plate-common/react';

import {
  HeadingPlugin,
  HeadingPlugin as ReactHeadingPlugin,
} from '../react/HeadingPlugin';
import { HEADING_LEVELS } from './constants';

describe('HeadingPlugin', () => {
  describe('when using default options', () => {
    it('should create plugins for all 6 heading levels', () => {
      const editor = createPlateEditor({
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(6);

      HEADING_LEVELS.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
        expect(plugin.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });

    it('should set hotkeys for the first 3 heading levels', () => {
      const editor = createPlateEditor({
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);

      for (let i = 0; i < 3; i++) {
        const plugin = headingPlugin.plugins[i];
        expect(
          plugin.shortcuts['toggleHeading' + (i + 1)].keys.at(-1).at(-1)
        ).toBe(String(i + 1));
      }

      for (let i = 3; i < 6; i++) {
        const plugin = headingPlugin.plugins[i];
        expect(plugin.options?.hotkey).toBeUndefined();
      }
    });
  });

  describe('when configuring custom levels', () => {
    it('should create plugins only for specified levels', () => {
      const editor = createPlateEditor({
        plugins: [
          HeadingPlugin.configure({
            options: { levels: [1, 3, 5] },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(3);

      const expectedLevels = ['h1', 'h3', 'h5'];
      expectedLevels.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
      });
    });
  });

  describe('when using a single level', () => {
    it('should create a plugin only for the specified level', () => {
      const editor = createPlateEditor({
        plugins: [
          HeadingPlugin.configure({
            options: { levels: 2 },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(2);
    });
  });

  describe('nested plugins', () => {
    it('should have correct structure and properties', () => {
      const editor = createPlateEditor({
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);

      headingPlugin.plugins.forEach((plugin, index) => {
        expect(plugin.isElement).toBe(true);
        expect(plugin.handlers?.onKeyDown).not.toBeDefined();
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });
});

describe('HeadingPluginReact', () => {
  describe('when using default options', () => {
    it('should create plugins for all 6 heading levels', () => {
      const editor = createPlateEditor({
        plugins: [ReactHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(ReactHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(6);

      HEADING_LEVELS.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
        expect(plugin.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });

    it('should set hotkeys for the first 3 heading levels', () => {
      const editor = createPlateEditor({
        plugins: [ReactHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(ReactHeadingPlugin);

      for (let i = 0; i < 3; i++) {
        const plugin = headingPlugin.plugins[i];
        expect(
          plugin.shortcuts['toggleHeading' + (i + 1)].keys.at(-1).at(-1)
        ).toBe(String(i + 1));
      }

      for (let i = 3; i < 6; i++) {
        const plugin = headingPlugin.plugins[i];
        expect(plugin.shortcuts['toggleHeading' + (i + 1)]).toBeUndefined();
      }
    });
  });

  describe('when configuring custom levels', () => {
    it('should create plugins only for specified levels', () => {
      const editor = createPlateEditor({
        plugins: [
          ReactHeadingPlugin.configure({
            options: { levels: [1, 3, 5] },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(ReactHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(3);

      const expectedLevels = ['h1', 'h3', 'h5'];
      expectedLevels.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
      });
    });

    it('should set hotkeys only for levels less than 4', () => {
      const editor = createPlateEditor({
        plugins: [
          ReactHeadingPlugin.configure({
            options: { levels: [1, 3, 5] },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(ReactHeadingPlugin);

      expect(headingPlugin.plugins[0].shortcuts.toggleHeading1).toBeDefined();
      expect(headingPlugin.plugins[1].shortcuts.toggleHeading3).toBeDefined();
      expect(headingPlugin.plugins[2].shortcuts.toggleHeading5).toBeUndefined();
    });
  });

  describe('nested plugins', () => {
    it('should have correct structure and properties', () => {
      const editor = createPlateEditor({
        plugins: [ReactHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(ReactHeadingPlugin);

      headingPlugin.plugins.forEach((plugin, index) => {
        expect(plugin.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });
});
