import {
  BaseParagraphPlugin,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { property, schema } from '@platejs/plite';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkMdx } from '../plugins';
import { compileMarkdownCodecs } from './markdownCodecs';

const elementPlugin = (name: string) =>
  defineBasePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

describe('Markdown node codec compiler', () => {
  it('indexes codecs and contexts by persisted schema identity', () => {
    let elementIdentity: string | undefined;
    let markIdentity: string | undefined;
    const ElementPlugin = defineBasePlugin('elementCapability', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          type: 'persistedElement',
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/markdown': {
            encode: ({ schema: innerSchema }) => {
              elementIdentity = innerSchema.type;

              return { type: 'text', value: 'element' };
            },
            kind: 'node',
          },
        }),
    });
    const MarkPlugin = defineBasePlugin('markCapability', {
      schema: {
        mark: {
          key: 'persistedMark',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/markdown': {
            encode: ({ schema: innerSchema2 }) => {
              markIdentity = innerSchema2.key;

              return { type: 'text', value: 'mark' };
            },
            kind: 'node',
            mark: true,
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [ElementPlugin, MarkPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownCodecs(editor);
    const options = {
      isBlock: () => false,
      isInline: () => true,
      registry: {},
      value: [],
    } as any;

    compiled.rules.persistedElement.serialize!(
      { children: [{ text: 'element' }], type: 'persistedElement' },
      options
    );
    compiled.rules.persistedMark.serialize!(
      { persistedMark: true, text: 'mark' },
      options
    );

    expect(compiled.rules.elementCapability).toBeUndefined();
    expect(compiled.rules.markCapability).toBeUndefined();
    expect(elementIdentity).toBe('persistedElement');
    expect(markIdentity).toBe('persistedMark');
  });

  it('round-trips custom MDX tags through the final application schema type', () => {
    const CustomPlugin = defineBasePlugin('customCapability', {
      codecs: ({ defineCodecs, schema: { type } }) =>
        defineCodecs({
          'text/markdown': {
            from: type,
            kind: 'node',
            decode: ({ node, parseAttributes }) =>
              node.attributes.some(
                (attribute) =>
                  attribute.type === 'mdxJsxAttribute' &&
                  attribute.name === 'decline'
              )
                ? undefined
                : {
                    ...parseAttributes(node.attributes),
                    children: [{ text: '' }],
                    type,
                  },
            encode: ({ node, propsToAttributes }) => {
              const { children: _, type: __, ...props } = node;

              return {
                attributes: propsToAttributes(props),
                children: [],
                name: type,
                type: 'mdxJsxFlowElement',
              };
            },
          },
        }),
      schema: {
        element: {
          properties: { label: property.string() },
          type: 'callout',
          void: 'block',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        CustomPlugin,
        MarkdownPlugin.configure({
          initialState: { remarkPlugins: [remarkMdx] },
        }),
      ],
      schema: {
        overrides: [
          schema.override(BaseParagraphPlugin, {
            element: { type: 'customParagraph' },
          }),
          schema.override(CustomPlugin, {
            element: { type: 'customElement' },
          }),
        ],
      },
    });
    const markdown = '<customElement label="Round trip" />';
    const document = editor.api.markdown.deserialize(markdown);

    expect(document.children).toEqual([
      {
        children: [{ text: '' }],
        label: 'Round trip',
        type: 'customElement',
      },
    ]);
    expect(editor.api.markdown.serialize({ value: document })).toBe(
      `${markdown}\n`
    );
    expect(
      editor.api.markdown.deserialize(markdown, {
        rules: {
          customCapability: {
            deserialize: () => ({
              children: [{ text: 'Overridden' }],
              type: 'customElement',
            }),
          },
        },
      }).children
    ).toEqual([
      {
        children: [{ text: 'Overridden' }],
        type: 'customElement',
      },
    ]);
    expect(editor.api.markdown.deserialize('Paragraph').children).toEqual([
      {
        children: [{ text: 'Paragraph' }],
        type: 'customParagraph',
      },
    ]);
    expect(editor.api.markdown.deserialize('<unknown />').children).toEqual([
      {
        children: [{ text: '<unknown />' }],
        type: 'customParagraph',
      },
    ]);
    expect(
      editor.api.markdown
        .deserialize('First\n\n\nSecond', { splitLineBreaks: true })
        .children.every(
          (node) => 'type' in node && node.type === 'customParagraph'
        )
    ).toBe(true);
    expect(
      editor.api.markdown.deserialize('<customElement decline />', {
        rules: {
          customElement: {
            deserialize: () => ({
              children: [{ text: 'Persisted alias ran' }],
              type: 'customElement',
            }),
          },
        },
      }).children
    ).toEqual([
      {
        children: [{ text: '<customElement decline />' }],
        type: 'customParagraph',
      },
    ]);
  });

  it('orders decode claims by priority and caches the compiled editor view', () => {
    const LowPlugin = elementPlugin('low').extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          decode: ({ schema: innerSchema3 }) => ({
            children: [{ text: '' }],
            type: innerSchema3.type,
          }),
          from: 'html',
          kind: 'node',
          priority: 10,
        },
      }),
    }));
    const HighPlugin = elementPlugin('high').extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          decode: ({ schema: innerSchema4 }) => ({
            children: [{ text: '' }],
            type: innerSchema4.type,
          }),
          from: 'html',
          kind: 'node',
          priority: 20,
        },
      }),
    }));
    const editor = createBaseEditor({
      plugins: [LowPlugin, HighPlugin, MarkdownPlugin],
    });
    const first = compileMarkdownCodecs(editor);

    expect(first.decodeBySource.get('html')?.map(({ owner }) => owner)).toEqual(
      ['high', 'low']
    );
    expect(compileMarkdownCodecs(editor)).toBe(first);
  });

  it('does not compile codecs from disabled plugins', () => {
    const DisabledPlugin = elementPlugin('disabled')
      .extend(({ defineCodecs }) => ({
        codecs: defineCodecs({
          'text/markdown': {
            decode: ({ schema: innerSchema5 }) => ({
              children: [{ text: '' }],
              type: innerSchema5.type,
            }),
            from: 'html',
            kind: 'node',
          },
        }),
      }))
      .configure({ enabled: false });
    const editor = createBaseEditor({
      plugins: [DisabledPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownCodecs(editor);

    expect(compiled.decodeBySource.has('html')).toBe(false);
    expect(compiled.rules.disabled).toBeUndefined();
  });

  it('rejects ambiguous equal-priority decode claims from one target', () => {
    const ConflictPlugin = elementPlugin('conflict').extend(
      ({ defineCodecs }) => ({
        codecs: defineCodecs({
          'text/markdown': [
            {
              decode: ({ schema: innerSchema6 }) => ({
                children: [{ text: '' }],
                type: innerSchema6.type,
              }),
              from: 'html',
              kind: 'node',
            },
            {
              decode: ({ schema: innerSchema7 }) => ({
                children: [{ text: '' }],
                type: innerSchema7.type,
              }),
              from: 'html',
              kind: 'node',
            },
          ],
        }),
      })
    );
    const editor = createBaseEditor({
      plugins: [ConflictPlugin, MarkdownPlugin],
    });

    expect(() => compileMarkdownCodecs(editor)).toThrow(
      'equal-priority decode claims'
    );
  });

  it('rejects unknown declaration fields at the runtime boundary', () => {
    const InvalidPlugin = elementPlugin('invalid').extend(
      ({ defineCodecs, schema: { type } }) => {
        const declaration = {
          decode: () => ({
            children: [{ text: '' }],
            type,
          }),
          from: 'html' as const,
          kind: 'node' as const,
        };
        const codecs = defineCodecs({
          'text/markdown': declaration,
        });

        return {
          // @plate-schema-adoption-negative-codec
          codecs: {
            ...codecs,
            'text/markdown': {
              ...declaration,
              typo: true,
            },
          },
        };
      }
    );
    const editor = createBaseEditor({
      plugins: [InvalidPlugin, MarkdownPlugin],
    });

    expect(() => compileMarkdownCodecs(editor)).toThrow('unknown field "typo"');
  });
});
