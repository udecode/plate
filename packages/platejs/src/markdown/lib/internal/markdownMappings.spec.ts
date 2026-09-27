import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  property,
  schema,
} from '../../../core';
import { MarkdownPlugin } from '../MarkdownPlugin';
import { remarkMdx } from '../plugins';
import { compileMarkdownMappings } from './markdownMappings';

const parseDocument = (
  editor: ReturnType<typeof createEditor>,
  source: string,
  options?: Parameters<typeof editor.api.markdown.parse>[1]
) => {
  const result = editor.api.markdown.parse(source, options);

  if (!result.ok) {
    throw new Error(
      result.diagnostics.map(({ message }) => message).join('\n')
    );
  }

  return result.document;
};

const elementPlugin = (name: string) =>
  definePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

describe('Markdown node mapping compiler', () => {
  it('indexes formats and contexts by persisted schema identity', () => {
    let elementIdentity: string | undefined;
    let markIdentity: string | undefined;
    let elementContext:
      | Readonly<{
          name: string;
          registryType: string | undefined;
          stateLabel: string;
          supportsElement: boolean;
        }>
      | undefined;
    let markContext:
      | Readonly<{
          installed: boolean;
          name: string;
          stateLabel: string;
        }>
      | undefined;
    const ElementPlugin = definePlugin('elementCapability', {
      initialState: { label: 'element-state' },
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          type: 'persistedElement',
        },
      },
      formats: ({ defineFormats, schema: { type } }) => {
        elementIdentity = type;

        return defineFormats({
          markdown: {
            encode: ({ name, pluginState, registry, schema: schemaView }) => {
              elementContext = {
                name,
                registryType: registry.type(name),
                stateLabel: pluginState.label,
                supportsElement: schemaView.element(type) !== undefined,
              };

              return {
                children: [{ type: 'text', value: 'element' }],
                type: 'paragraph',
              };
            },
          },
        });
      },
    });
    const MarkPlugin = definePlugin('markCapability', {
      initialState: { label: 'mark-state' },
      schema: {
        mark: {
          key: 'persistedMark',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
      formats: ({ defineFormats, schema: { key } }) => {
        markIdentity = key;

        return defineFormats({
          markdown: {
            encode: ({ name, pluginState, registry }) => {
              markContext = {
                installed: registry.has(name),
                name,
                stateLabel: pluginState.label,
              };

              return {
                children: [{ type: 'text', value: 'mark' }],
                type: 'strong',
              };
            },
            mark: true,
          },
        });
      },
    });
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ElementPlugin, MarkPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownMappings(editor);
    const result = editor.api.markdown.serialize({
      document: {
        children: [
          { children: [{ text: 'element' }], type: 'persistedElement' },
          {
            children: [{ persistedMark: true, text: 'mark' }],
            type: 'paragraph',
          },
        ],
      },
    });

    expect(result.ok).toBe(true);
    expect(compiled.rules.elementCapability).toBeUndefined();
    expect(compiled.rules.markCapability).toBeUndefined();
    expect(elementIdentity).toBe('persistedElement');
    expect(markIdentity).toBe('persistedMark');
    expect(elementContext).toEqual({
      name: 'elementCapability',
      registryType: 'persistedElement',
      stateLabel: 'element-state',
      supportsElement: true,
    });
    expect(markContext).toEqual({
      installed: true,
      name: 'markCapability',
      stateLabel: 'mark-state',
    });
  });

  it('round-trips custom MDX tags through the final application schema type', () => {
    const CustomPlugin = definePlugin('customCapability', {
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({
          markdown: {
            from: type,
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
    const editor = createEditor({
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
    const document = parseDocument(editor, markdown);

    expect(document.children).toEqual([
      {
        children: [{ text: '' }],
        label: 'Round trip',
        type: 'customElement',
      },
    ]);
    const serialized = editor.api.markdown.serialize({ document });

    expect(serialized.ok).toBe(true);
    if (!serialized.ok) throw new Error('Expected Markdown serialization.');
    expect(serialized.data).toBe(`${markdown}\n`);
    expect(parseDocument(editor, 'Paragraph').children).toEqual([
      {
        children: [{ text: 'Paragraph' }],
        type: 'customParagraph',
      },
    ]);
    expect(editor.api.markdown.parse('<unknown />')).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          severity: 'error',
        }),
      ],
      ok: false,
    });
    expect(
      parseDocument(editor, 'First\n\n\nSecond', {
        splitLineBreaks: true,
      }).children.every(
        (node) => 'type' in node && node.type === 'customParagraph'
      )
    ).toBe(true);
    expect(
      editor.api.markdown.parse('<customElement decline />')
    ).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          severity: 'error',
        }),
      ],
      ok: false,
    });
  });

  it('orders decode claims by priority and caches the compiled editor view', () => {
    const LowPlugin = elementPlugin('low').extend(({ defineFormats }) => ({
      formats: defineFormats({
        markdown: {
          decode: ({ schema: innerSchema3 }) => ({
            children: [{ text: '' }],
            type: innerSchema3.type,
          }),
          from: 'html',
          priority: 10,
        },
      }),
    }));
    const HighPlugin = elementPlugin('high').extend(({ defineFormats }) => ({
      formats: defineFormats({
        markdown: {
          decode: ({ schema: innerSchema4 }) => ({
            children: [{ text: '' }],
            type: innerSchema4.type,
          }),
          from: 'html',
          priority: 20,
        },
      }),
    }));
    const editor = createEditor({
      plugins: [LowPlugin, HighPlugin, MarkdownPlugin],
    });
    const first = compileMarkdownMappings(editor);

    expect(first.decodeBySource.get('html')?.map(({ owner }) => owner)).toEqual(
      ['high', 'low']
    );
    expect(compileMarkdownMappings(editor)).toBe(first);
  });

  it('does not compile formats from disabled plugins', () => {
    const DisabledPlugin = elementPlugin('disabled')
      .extend(({ defineFormats }) => ({
        formats: defineFormats({
          markdown: {
            decode: ({ schema: innerSchema5 }) => ({
              children: [{ text: '' }],
              type: innerSchema5.type,
            }),
            from: 'html',
          },
        }),
      }))
      .configure({ enabled: false });
    const editor = createEditor({
      plugins: [DisabledPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownMappings(editor);

    expect(compiled.decodeBySource.has('html')).toBe(false);
    expect(compiled.rules.disabled).toBeUndefined();
  });

  it('rejects ambiguous equal-priority decode claims from one target', () => {
    const ConflictPlugin = elementPlugin('conflict').extend(
      ({ defineFormats }) => ({
        formats: defineFormats({
          markdown: [
            {
              decode: ({ schema: innerSchema6 }) => ({
                children: [{ text: '' }],
                type: innerSchema6.type,
              }),
              from: 'html',
            },
            {
              decode: ({ schema: innerSchema7 }) => ({
                children: [{ text: '' }],
                type: innerSchema7.type,
              }),
              from: 'html',
            },
          ],
        }),
      })
    );
    expect(() =>
      createEditor({ plugins: [ConflictPlugin, MarkdownPlugin] })
    ).toThrow('equal-priority decode claims');
  });

  it('rejects unknown declaration fields at the runtime boundary', () => {
    const InvalidPlugin = elementPlugin('invalid').extend(
      ({ defineFormats, schema: { type } }) => {
        const declaration = {
          decode: () => ({
            children: [{ text: '' }],
            type,
          }),
          from: 'html' as const,
        };
        const formats = defineFormats({
          markdown: declaration,
        });

        return {
          // @plate-schema-adoption-negative-format
          formats: {
            ...formats,
            markdown: {
              ...declaration,
              typo: true,
            },
          },
        };
      }
    );
    expect(() =>
      createEditor({ plugins: [InvalidPlugin, MarkdownPlugin] })
    ).toThrow('unknown field "typo"');
  });
});
