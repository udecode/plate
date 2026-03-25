import { KEYS, createSlateEditor } from 'platejs';

import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHeadingPlugin,
} from './BaseHeadingPlugin';

describe('BaseHeadingPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('when using default options', () => {
    it('creates plugins for all 6 heading levels', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      } as any);

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
      } as any);

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
      } as any);

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(2);
    });
  });

  describe('nested plugins', () => {
    it('preserves heading element metadata on nested plugins', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      } as any);

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

  it.each([
    ['h1', BaseH1Plugin],
    ['h2', BaseH2Plugin],
    ['h3', BaseH3Plugin],
    ['h4', BaseH4Plugin],
    ['h5', BaseH5Plugin],
    ['h6', BaseH6Plugin],
  ])('binds the %s toggle transform to toggleBlock', (key, plugin) => {
    const editor = createSlateEditor({
      plugins: [plugin as any],
    } as any);
    const toggleBlockSpy = spyOn(editor.tf, 'toggleBlock');

    (editor.getTransforms(plugin as any) as any)[key].toggle();

    expect(toggleBlockSpy).toHaveBeenCalledWith(editor.getType(key as any));
  });
});
