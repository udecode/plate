import { KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { HeadingPlugin } from '../react/HeadingPlugin';

describe('HeadingPlugin', () => {
  describe('when using default options', () => {
    it('should create plugins for all 6 heading levels', () => {
      const editor = createPlateEditor({
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(6);

      KEYS.heading.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
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
        expect(plugin.node.isElement).toBe(true);
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
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(6);

      KEYS.heading.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
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

  describe('nested plugins', () => {
    it('should have correct structure and properties', () => {
      const editor = createPlateEditor({
        plugins: [HeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(HeadingPlugin);

      headingPlugin.plugins.forEach((plugin, index) => {
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });
});
