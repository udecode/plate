import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  property,
  schema,
} from '../../../core';
import { createTestEditor } from '../__tests__/createTestEditor';
import { MarkdownPlugin } from '../MarkdownPlugin';
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

const tagPlugin = (
  name: string,
  {
    inline = false,
    nestedTags,
  }: { inline?: boolean; nestedTags?: readonly string[] } = {}
) =>
  definePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        ...(inline ? { inline: true } : {}),
      },
    },
    formats: ({ defineFormats, schema: { type } }) =>
      defineFormats({
        markdown: {
          tag: type,
          ...(nestedTags ? { nestedTags } : {}),
          decode: () => ({ children: [{ text: '' }], type }),
        },
      }),
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
            wrap: ({ name, pluginState, registry, value }) => {
              markContext = {
                installed: registry.has(name),
                name,
                stateLabel: pluginState.label,
              };

              expect(value).toBe(true);

              return {
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
    expect([...compiled.encodeByType.keys()]).toContain('persistedElement');
    expect(compiled.encodeByType.has('elementCapability')).toBe(false);
    expect([...compiled.encodeByMark.keys()]).toContain('persistedMark');
    expect(compiled.encodeByMark.has('markCapability')).toBe(false);
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

  it('round-trips custom tags through the final application schema type', () => {
    const CustomPlugin = definePlugin('customCapability', {
      formats: ({ defineFormats, schema: { type } }) =>
        defineFormats({
          markdown: {
            tag: type,
            decode: ({ node, readTagAttributes }) =>
              node.attributes.some(
                (attribute) =>
                  attribute.type === 'mdxJsxAttribute' &&
                  attribute.name === 'decline'
              )
                ? undefined
                : {
                    ...readTagAttributes().properties,
                    children: [{ text: '' }],
                    type,
                  },
            encode: ({ encodeAttributes, node }) => {
              const { children: _, type: __, ...props } = node;

              return {
                attributes: encodeAttributes(props),
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
          initialState: { remarkPlugins: [] },
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
      parseDocument(editor, 'First\n\n\nSecond').children.every(
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
          node: 'html',
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
          node: 'html',
          priority: 20,
        },
      }),
    }));
    const editor = createEditor({
      plugins: [LowPlugin, HighPlugin, MarkdownPlugin],
    });
    const first = compileMarkdownMappings(editor);

    // The built-in html decoder runs last, after every feature declines.
    expect(first.decodeByNode.get('html')?.map(({ owner }) => owner)).toEqual([
      'high',
      'low',
      'markdown',
    ]);
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
            node: 'html',
          },
        }),
      }))
      .configure({ enabled: false });
    const editor = createEditor({
      plugins: [DisabledPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownMappings(editor);

    expect(
      compiled.decodeByNode.get('html')?.map(({ owner }) => owner)
    ).toEqual(['markdown']);
    expect(compiled.encodeByType.has('disabled')).toBe(false);
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
              node: 'html',
            },
            {
              decode: ({ schema: innerSchema7 }) => ({
                children: [{ text: '' }],
                type: innerSchema7.type,
              }),
              node: 'html',
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
          node: 'html' as const,
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
  it('falls back to the built-in decoder when every feature declines', () => {
    const DecliningPlugin = elementPlugin('declining').extend(
      ({ defineFormats, schema: { type } }) => ({
        formats: defineFormats({
          markdown: {
            node: 'paragraph',
            decode: ({ node }) =>
              node.children.some(
                (child) => child.type === 'text' && child.value === 'claim'
              )
                ? { children: [{ text: 'claimed' }], type }
                : undefined,
          },
        }),
      })
    );
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, DecliningPlugin, MarkdownPlugin],
    });

    expect(parseDocument(editor, 'claim\n\nplain').children).toEqual([
      { children: [{ text: 'claimed' }], type: 'declining' },
      { children: [{ text: 'plain' }], type: 'paragraph' },
    ]);
  });

  it('stops dispatch at a refusal', () => {
    let lowerRan = false;
    const RefusingPlugin = elementPlugin('refusing').extend(
      ({ defineFormats }) => ({
        formats: defineFormats({
          markdown: {
            node: 'thematicBreak',
            priority: 10,
            decode: ({ refuse }) => refuse('Refused on purpose.'),
          },
        }),
      })
    );
    const LowerPlugin = elementPlugin('lower').extend(
      ({ defineFormats, schema: { type } }) => ({
        formats: defineFormats({
          markdown: {
            node: 'thematicBreak',
            decode: () => {
              lowerRan = true;

              return { children: [{ text: '' }], type };
            },
          },
        }),
      })
    );
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        RefusingPlugin,
        LowerPlugin,
        MarkdownPlugin,
      ],
    });

    expect(
      editor.api.markdown.parse('a\n\n***', { lossPolicy: 'allow' })
    ).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          action: 'dropped',
          code: 'markdown-unsupported-node',
          message: 'Refused on purpose.',
          owner: 'refusing',
        }),
      ],
      ok: true,
    });
    expect(lowerRan).toBe(false);
  });

  it('composes every mark mapping on one selector and decodes children once', () => {
    const editor = createTestEditor();

    expect(
      parseDocument(
        editor,
        'a <span style="color: red; background-color: yellow;">**b**</span>'
      ).children
    ).toEqual([
      {
        children: [
          { text: 'a ' },
          { backgroundColor: 'yellow', bold: true, color: 'red', text: 'b' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('keeps a mark tag as source text when no mark mapping contributes', () => {
    const editor = createTestEditor();
    const result = editor.api.markdown.parse(
      '<span style="text-shadow: 1px;">x</span>',
      { lossPolicy: 'allow' }
    );

    expect(result).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          action: 'replaced',
          code: 'markdown-unsupported-node',
          nodeType: 'span',
        }),
      ],
      ok: true,
    });
    if (!result.ok) throw new Error('Expected a document.');
    expect(result.document.children).toEqual([
      {
        children: [{ text: '<span style="text-shadow: 1px;">x</span>' }],
        type: 'paragraph',
      },
    ]);
  });

  it('rejects mixing mark and element decoding on one selector', () => {
    const ElementTag = tagPlugin('strong');
    const MarkTag = definePlugin('markTag', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          markdown: {
            tag: 'strong',
            mark: true,
            decode: () => true,
          },
        }),
    });

    expect(() =>
      createEditor({ plugins: [ElementTag, MarkTag, MarkdownPlugin] })
    ).toThrow('mix mark and element decoding for "strong"');
  });

  it('rejects invalid and reserved tag names and inconsistent tag kinds', () => {
    expect(() =>
      createEditor({
        plugins: [tagPlugin('outer', { nestedTags: ['x.y'] }), MarkdownPlugin],
      })
    ).toThrow('must match');
    expect(() =>
      createEditor({ plugins: [tagPlugin('block'), MarkdownPlugin] })
    ).toThrow('reserved "block" tag');
    // A nested tag is block-level; an inline element cannot share its name.
    expect(() =>
      createEditor({
        plugins: [
          tagPlugin('outer', { nestedTags: ['shared'] }),
          tagPlugin('shared', { inline: true }),
          MarkdownPlugin,
        ],
      })
    ).toThrow('declares tag "shared" as');
  });

  it('rejects a priority on a mark mapping and a second encoder for one mark', () => {
    const markPlugin = (name: string, markdown: unknown) =>
      definePlugin(name, {
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }).extend(({ defineFormats }) => ({
        // @plate-schema-adoption-negative-format
        formats: {
          ...defineFormats({
            markdown: { mark: true, wrap: () => undefined },
          }),
          markdown,
        } as never,
      }));

    expect(() =>
      createEditor({
        plugins: [
          markPlugin('prioritized', {
            decode: () => true,
            mark: true,
            priority: 1,
            tag: 'x',
          }),
          MarkdownPlugin,
        ],
      })
    ).toThrow('mark mappings compose and take no priority');
    expect(() =>
      createEditor({
        plugins: [
          markPlugin('twice', [
            { mark: true, wrap: () => ({ type: 'strong' }) },
            { mark: true, wrap: () => ({ type: 'strong' }) },
          ]),
          MarkdownPlugin,
        ],
      })
    ).toThrow('one encoder for target "twice"');
  });

  it('reads a mark without an encoder and reports it on export', () => {
    const ReadOnlyMark = definePlugin('readOnlyMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          markdown: { tag: 'ro', mark: true, decode: () => true },
        }),
    });
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, ReadOnlyMark, MarkdownPlugin],
    });
    const document = parseDocument(editor, '<ro>x</ro>');

    expect(document.children).toEqual([
      { children: [{ readOnlyMark: true, text: 'x' }], type: 'paragraph' },
    ]);
    expect(
      editor.api.markdown.serialize({ document, lossPolicy: 'allow' })
    ).toMatchObject({
      data: 'x\n',
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          nodeType: 'readOnlyMark',
        }),
      ],
      ok: true,
    });
  });
});
