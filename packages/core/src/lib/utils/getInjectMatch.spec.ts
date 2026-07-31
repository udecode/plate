import { schema } from '@platejs/plite';

import { createBaseEditor } from '../editor';
import type { AnyBasePlugin } from '../plugin';
import { createBasePlugin } from '../plugin';
import { getInjectMatch } from './getInjectMatch';

const ParagraphPlugin = createBasePlugin({
  name: 'paragraph',
  type: 'paragraph-test',
  schema: {
    element: { content: schema.content.open({ default: 'text', min: 1 }) },
  },
});

const QuotePlugin = createBasePlugin({
  name: 'quote',
  type: 'blockquote-test',
  schema: {
    element: {
      content: schema.content.group('block'),
    },
  },
});

const LinkPlugin = createBasePlugin({
  name: 'link',
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
    initialValue: [
      {
        children: [{ children: [{ text: 'nested' }], type: 'paragraph-test' }],
        type: 'blockquote-test',
      },
    ],
  });

describe('getInjectMatch', () => {
  it('respects isElement, isBlock, and isLeaf filters', () => {
    const elementPlugin = createBasePlugin({
      name: 'elementFilter',
      inject: { isElement: true },
    });
    const blockPlugin = createBasePlugin({
      name: 'blockFilter',
      inject: { isBlock: true },
    });
    const leafPlugin = createBasePlugin({
      name: 'leafFilter',
      inject: { isLeaf: true },
    });

    const editor = createMatchEditor(elementPlugin);
    const elementMatch = getInjectMatch(
      editor,
      editor.plugin(elementPlugin).plugin
    );
    const blockMatch = getInjectMatch(
      createMatchEditor(blockPlugin),
      createMatchEditor(blockPlugin).plugin(blockPlugin).plugin
    );
    const leafMatch = getInjectMatch(
      createMatchEditor(leafPlugin),
      createMatchEditor(leafPlugin).plugin(leafPlugin).plugin
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

  it('respects targetPluginNames and excludePlugins', () => {
    const targetPlugin = createBasePlugin({
      targetPluginNames: ['paragraph'],
      name: 'targetFilter',
    });
    const excludePlugin = createBasePlugin({
      name: 'excludeFilter',
      inject: { excludePlugins: ['quote'] },
    });
    const missingTargetPlugin = createBasePlugin({
      name: 'missingTargetFilter',
      targetPluginNames: ['missingOptionalPlugin'],
    });

    const targetEditor = createMatchEditor(targetPlugin);
    const excludeEditor = createMatchEditor(excludePlugin);
    const targetMatch = getInjectMatch(
      targetEditor,
      targetEditor.plugin(targetPlugin).plugin
    );
    const excludeMatch = getInjectMatch(
      excludeEditor,
      excludeEditor.plugin(excludePlugin).plugin
    );
    const missingTargetEditor = createMatchEditor(missingTargetPlugin);
    const missingTargetMatch = getInjectMatch(
      missingTargetEditor,
      missingTargetEditor.plugin(missingTargetPlugin).plugin
    );

    expect(
      targetMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      targetMatch(
        { children: [{ text: 'leaf' }], type: 'blockquote-test' } as any,
        [0]
      )
    ).toBe(false);
    expect(
      excludeMatch(
        { children: [{ text: 'leaf' }], type: 'blockquote-test' } as any,
        [0]
      )
    ).toBe(false);
    expect(
      excludeMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      missingTargetMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0]
      )
    ).toBe(false);
  });

  it('respects excludeBelowPlugins and maxLevel', () => {
    const plugin = createBasePlugin({
      name: 'depthFilter',
      inject: {
        excludeBelowPlugins: ['quote'],
        maxLevel: 1,
      },
    });

    const editor = createMatchEditor(plugin);
    const match = getInjectMatch(editor, editor.plugin(plugin).plugin);

    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0, 0]
      )
    ).toBe(false);
    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'blockquote-test' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'paragraph-test' } as any,
        [0, 0, 0]
      )
    ).toBe(false);
  });
});
