import { schema } from '../../core';
import { createEditor } from '../editor';
import type { AnyBasePlugin } from '../plugin';
import { defineBasePlugin } from '../plugin';
import { getInjectMatch } from './getInjectMatch';

const ParagraphPlugin = defineBasePlugin('paragraph', {
  schema: {
    element: { content: schema.content.open({ default: 'text', min: 1 }) },
  },
});

const QuotePlugin = defineBasePlugin('quote', {
  schema: {
    element: {
      content: schema.content.group('block'),
    },
  },
});

const LinkPlugin = defineBasePlugin('link', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const createMatchEditor = (plugin: AnyBasePlugin) =>
  createEditor({
    plugins: [ParagraphPlugin, QuotePlugin, LinkPlugin, plugin],
    initialValue: [
      {
        children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
        type: 'quote',
      },
    ],
  });

describe('getInjectMatch', () => {
  it('respects isElement, isBlock, and isLeaf filters', () => {
    const elementPlugin = defineBasePlugin('elementFilter', {
      inject: { isElement: true },
    });
    const blockPlugin = defineBasePlugin('blockFilter', {
      inject: { isBlock: true },
    });
    const leafPlugin = defineBasePlugin('leafFilter', {
      inject: { isLeaf: true },
    });

    const editor = createMatchEditor(elementPlugin);
    const elementMatch = getInjectMatch(editor, editor.plugin(elementPlugin));
    const blockMatch = getInjectMatch(
      createMatchEditor(blockPlugin),
      createMatchEditor(blockPlugin).plugin(blockPlugin)
    );
    const leafMatch = getInjectMatch(
      createMatchEditor(leafPlugin),
      createMatchEditor(leafPlugin).plugin(leafPlugin)
    );

    expect(elementMatch({ text: 'leaf' } as any, [0, 0])).toBe(false);
    expect(
      elementMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      blockMatch({ children: [{ text: 'leaf' }], type: 'link' } as any, [0])
    ).toBe(false);
    expect(
      blockMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      leafMatch({ children: [{ text: 'leaf' }], type: 'paragraph' } as any, [0])
    ).toBe(false);
    expect(leafMatch({ text: 'leaf' } as any, [0, 0])).toBe(true);
  });

  it('respects targetPlugins and excludePlugins', () => {
    const targetPlugin = defineBasePlugin('targetFilter', {
      targetPlugins: [ParagraphPlugin],
    });
    const excludePlugin = defineBasePlugin('excludeFilter', {
      inject: { excludePlugins: [QuotePlugin] },
    });
    const missingTargetPlugin = defineBasePlugin('missingTargetFilter', {
      targetPlugins: ['missingOptionalPlugin'],
    });

    const targetEditor = createMatchEditor(targetPlugin);
    const excludeEditor = createMatchEditor(excludePlugin);
    const targetMatch = getInjectMatch(
      targetEditor,
      targetEditor.plugin(targetPlugin)
    );
    const excludeMatch = getInjectMatch(
      excludeEditor,
      excludeEditor.plugin(excludePlugin)
    );
    const missingTargetEditor = createMatchEditor(missingTargetPlugin);
    const missingTargetMatch = getInjectMatch(
      missingTargetEditor,
      missingTargetEditor.plugin(missingTargetPlugin)
    );

    expect(
      targetMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      targetMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(targetMatch({ text: 'leaf' } as any, [0, 0])).toBe(false);
    expect(
      excludeMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(
      excludeMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0]
      )
    ).toBe(true);
    expect(
      missingTargetMatch(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0]
      )
    ).toBe(false);
  });

  it('respects excludeBelowPlugins and maxLevel', () => {
    const plugin = defineBasePlugin('depthFilter', {
      inject: {
        excludeBelowPlugins: [QuotePlugin],
        maxLevel: 1,
      },
    });

    const editor = createMatchEditor(plugin);
    const match = getInjectMatch(editor, editor.plugin(plugin));

    expect(
      match({ children: [{ text: 'leaf' }], type: 'paragraph' } as any, [0, 0])
    ).toBe(false);
    expect(
      match({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(true);
    expect(
      match(
        { children: [{ text: 'leaf' }], type: 'paragraph' } as any,
        [0, 0, 0]
      )
    ).toBe(false);
  });

  it('resolves string exclusions through configured schema types', () => {
    const AliasedQuotePlugin = defineBasePlugin('aliasedQuote', {
      schema: {
        element: {
          content: schema.content.group('block'),
          type: 'persistedQuote',
        },
      },
    });
    const plugin = defineBasePlugin('stringFilter', {
      inject: {
        excludeBelowPlugins: ['aliasedQuote'],
      },
    });
    const editor = createEditor({
      plugins: [ParagraphPlugin, AliasedQuotePlugin, plugin],
      initialValue: [
        {
          children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
          type: 'persistedQuote',
        },
      ],
    });
    const match = getInjectMatch(editor, editor.plugin(plugin));

    expect(
      match({ children: [{ text: 'leaf' }], type: 'paragraph' } as any, [0, 0])
    ).toBe(false);
  });

  it('does not collapse exact exclusions to a same-name plugin family', () => {
    const ForeignQuotePlugin = defineBasePlugin('quote', {});
    const plugin = defineBasePlugin('familyFilter', {
      inject: {
        excludeBelowPlugins: [ForeignQuotePlugin],
        excludePlugins: [ForeignQuotePlugin],
      },
    });
    const editor = createMatchEditor(plugin);
    const match = getInjectMatch(editor, editor.plugin(plugin));

    expect(
      match({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(true);
    expect(
      match({ children: [{ text: 'leaf' }], type: 'paragraph' } as any, [0, 0])
    ).toBe(true);
  });
});
