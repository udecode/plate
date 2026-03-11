import { KEYS, createSlateEditor } from 'platejs';

import { BaseHeadingPlugin } from './BaseHeadingPlugin';

describe('BaseHeadingPlugin', () => {
  describe('when using default options', () => {
    it('creates plugins for all 6 heading levels', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);
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
    it('creates plugins only for specified levels', () => {
      const editor = createSlateEditor({
        plugins: [
          BaseHeadingPlugin.configure({
            options: { levels: [1, 3, 5] },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(3);

      const expectedLevels = ['h1', 'h3', 'h5'];
      expectedLevels.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
      });
    });
  });

  describe('when using a single level', () => {
    it('creates plugins up to the configured level', () => {
      const editor = createSlateEditor({
        plugins: [
          BaseHeadingPlugin.configure({
            options: { levels: 2 },
          }),
        ],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(2);
    });
  });

  describe('nested plugins', () => {
    it('preserves heading element metadata on nested plugins', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);

      headingPlugin.plugins.forEach((plugin: any, index: number) => {
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.handlers?.onKeyDown).not.toBeDefined();
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });
});
