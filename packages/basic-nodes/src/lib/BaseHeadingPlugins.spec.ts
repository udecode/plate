import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
} from './BaseHeadingPlugins';

const headingPlugins = [
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
] as const;
const headingKeys = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

describe('base heading plugins', () => {
  it('registers every heading schema and parser', () => {
    const editor = createBaseEditor({
      plugins: headingPlugins,
    });

    headingPlugins.forEach((plugin, index) => {
      const level = headingKeys[index]!;
      const resolvedPlugin = editor.getPlugin(plugin);

      expect(resolvedPlugin.key).toBe(level);
      expect(editor.read.schema.element(resolvedPlugin.type)).toBeDefined();
      expect(editor.read.schema.isElementTypeInGroup(level, 'block')).toBe(
        true
      );
      expect(
        editor.read.schema.createAndFill(resolvedPlugin.type)
      ).toMatchObject({
        children: [{ text: '' }],
        type: resolvedPlugin.type,
      });
      expect(resolvedPlugin.parsers.html?.deserializer?.rules).toEqual([
        { validNodeName: `H${index + 1}` },
      ]);
    });
  });

  it('supports ordinary subset composition', () => {
    const editor = createBaseEditor({
      plugins: [BaseH1Plugin, BaseH3Plugin, BaseH5Plugin],
    });

    [BaseH1Plugin, BaseH3Plugin, BaseH5Plugin].forEach((plugin) => {
      expect(editor.getPlugin(plugin).key).toBe(plugin.key);
      expect(editor.read.schema.element(plugin.key)).toBeDefined();
    });

    expect(editor.read.schema.element(KEYS.h2)).toBeNull();
    expect(editor.read.schema.element(KEYS.h4)).toBeNull();
    expect(editor.read.schema.element(KEYS.h6)).toBeNull();
  });

  it('binds heading tx groups to block toggles', () => {
    const h1 = createBaseEditor({
      plugins: [BaseH1Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h2 = createBaseEditor({
      plugins: [BaseH2Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h3 = createBaseEditor({
      plugins: [BaseH3Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h4 = createBaseEditor({
      plugins: [BaseH4Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h5 = createBaseEditor({
      plugins: [BaseH5Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });
    const h6 = createBaseEditor({
      plugins: [BaseH6Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
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
