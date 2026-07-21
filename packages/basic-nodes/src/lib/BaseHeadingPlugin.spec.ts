import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

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
  describe('when using default options', () => {
    it('creates plugins for all 6 heading levels', () => {
      const editor = createBaseEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);
      expect(headingPlugin.plugins).toHaveLength(6);

      KEYS.heading.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index]!;
        expect(plugin.key).toBe(level);
        expect(plugin.node.element).toBeDefined();
        expect(editor.read.schema.isElementTypeInGroup(level, 'block')).toBe(
          true
        );
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });

  describe('when configuring custom levels', () => {
    it('creates plugins only for specified levels', () => {
      const editor = createBaseEditor({
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
        const plugin = headingPlugin.plugins[index]!;
        expect(plugin.key).toBe(level);
      });
    });
  });

  describe('when using a single level', () => {
    it('creates plugins up to the configured level', () => {
      const editor = createBaseEditor({
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
      const editor = createBaseEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = editor.getPlugin(BaseHeadingPlugin);

      headingPlugin.plugins.forEach((plugin, index) => {
        expect(plugin.node.element).toBeDefined();
        expect(
          editor.read.schema.createAndFill(plugin.node.type)
        ).toMatchObject({
          children: [{ text: '' }],
          type: plugin.node.type,
        });
        expect(plugin.handlers?.onKeyDown).not.toBeDefined();
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });

  it('binds heading tx groups to block toggles', () => {
    const h1 = createBaseEditor({
      plugins: [BaseH1Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h2 = createBaseEditor({
      plugins: [BaseH2Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h3 = createBaseEditor({
      plugins: [BaseH3Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h4 = createBaseEditor({
      plugins: [BaseH4Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h5 = createBaseEditor({
      plugins: [BaseH5Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h6 = createBaseEditor({
      plugins: [BaseH6Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    h1.update.h1.toggle();
    h2.update.h2.toggle();
    h3.update.h3.toggle();
    h4.update.h4.toggle();
    h5.update.h5.toggle();
    h6.update.h6.toggle();

    expect(h1.read.children()[0]).toMatchObject({ type: KEYS.h1 });
    expect(h2.read.children()[0]).toMatchObject({ type: KEYS.h2 });
    expect(h3.read.children()[0]).toMatchObject({ type: KEYS.h3 });
    expect(h4.read.children()[0]).toMatchObject({ type: KEYS.h4 });
    expect(h5.read.children()[0]).toMatchObject({ type: KEYS.h5 });
    expect(h6.read.children()[0]).toMatchObject({ type: KEYS.h6 });
  });
});
