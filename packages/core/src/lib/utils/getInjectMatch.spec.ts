import { schema } from '@platejs/plite';

import { createBaseEditor } from '../editor';
import type { AnyBasePlugin } from '../plugin';
import { createBasePlugin } from '../plugin';
import { getInjectMatch } from './getInjectMatch';

const ParagraphPlugin = createBasePlugin({
  key: 'paragraph',
  type: 'paragraph-test',
  schema: {
    element: { content: schema.content.open({ default: 'text', min: 1 }) },
  },
});

const QuotePlugin = createBasePlugin({
  key: 'quote',
  type: 'quote',
  schema: {
    element: {
      content: schema.content.group('block'),
    },
  },
});

const LinkPlugin = createBasePlugin({
  key: 'link',
  type: 'a',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const createMatchEditor = (plugin: AnyBasePlugin) =>
  createBaseEditor({
    plugins: [ParagraphPlugin, QuotePlugin, LinkPlugin, plugin],
    value: [
      {
        children: [{ children: [{ text: 'nested' }], type: 'paragraph-test' }],
        type: 'quote',
      },
    ],
  });

describe('getInjectMatch', () => {
  it('respects isElement, isBlock, and isLeaf filters', () => {
    const elementPlugin = createBasePlugin({
      inject: { isElement: true },
      key: 'elementFilter',
    });
    const blockPlugin = createBasePlugin({
      inject: { isBlock: true },
      key: 'blockFilter',
    });
    const leafPlugin = createBasePlugin({
      inject: { isLeaf: true },
      key: 'leafFilter',
    });

    const editor = createMatchEditor(elementPlugin);
    const elementMatch = getInjectMatch(
      editor,
      editor.getPlugin(elementPlugin)
    );
    const blockMatch = getInjectMatch(
      createMatchEditor(blockPlugin),
      createMatchEditor(blockPlugin).getPlugin(blockPlugin)
    );
    const leafMatch = getInjectMatch(
      createMatchEditor(leafPlugin),
      createMatchEditor(leafPlugin).getPlugin(leafPlugin)
    );

    expect(elementMatch({ text: 'leaf' } as any, [0, 0])).toBe(false);
    expect(
      elementMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      blockMatch({ children: [{ text: 'leaf' }], type: 'a' } as any, [0])
    ).toBe(false);
    expect(
      blockMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      leafMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(false);
    expect(leafMatch({ text: 'leaf' } as any, [0, 0])).toBe(true);
  });

  it('respects targetPluginKeys and excludePlugins', () => {
    const targetPlugin = createBasePlugin({
      config: { targetPluginKeys: ['paragraph'] },
      key: 'targetFilter',
    });
    const excludePlugin = createBasePlugin({
      inject: { excludePlugins: ['quote'] },
      key: 'excludeFilter',
    });

    const targetEditor = createMatchEditor(targetPlugin);
    const excludeEditor = createMatchEditor(excludePlugin);
    const targetMatch = getInjectMatch(
      targetEditor,
      targetEditor.getPlugin(targetPlugin)
    );
    const excludeMatch = getInjectMatch(
      excludeEditor,
      excludeEditor.getPlugin(excludePlugin)
    );

    expect(
      targetMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      targetMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(
      excludeMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(
      excludeMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
  });

  it('respects excludeBelowPlugins and maxLevel', () => {
    const plugin = createBasePlugin({
      inject: {
        excludeBelowPlugins: ['quote'],
        maxLevel: 1,
      },
      key: 'depthFilter',
    });

    const editor = createMatchEditor(plugin);
    const match = getInjectMatch(editor, editor.getPlugin(plugin));

    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0, 0]
      )
    ).toBe(false);
    expect(
      match({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(true);
    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0, 0, 0]
      )
    ).toBe(false);
  });
});
