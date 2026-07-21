import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  definePropertyPolicy,
  element,
  type EditorExtension,
  type EditorExtensionInput,
  property,
  schema,
  type SchemaContentRule,
  type SchemaElement,
  type SchemaElementTypes,
  target,
} from '@platejs/plite';

const typeOnly = (_callback: () => void) => {};

describe('schema declaration builders', () => {
  it('defines frozen structural value laws and stable policy identity', () => {
    const input = {
      id: 'positive',
      validate: (value: unknown): value is number =>
        typeof value === 'number' && value > 0,
      version: 2,
    };
    const Positive = definePropertyPolicy<number>(input);

    input.validate = (_value): _value is number => false;
    const Width = property.number({
      default: 12,
      omitDefault: true,
      policy: Positive,
    });

    assert.equal(Object.isFrozen(Positive), true);
    assert.equal(Object.isFrozen(Width), true);
    assert.deepEqual(Width, {
      default: 12,
      equality: 'structural',
      kind: 'number',
      omitDefault: true,
      policy: Positive,
    });
    assert.deepEqual(JSON.parse(JSON.stringify(Width.policy)), {
      id: 'positive',
      version: 2,
    });
    assert.equal(Positive.validate('1'), false);
    assert.equal(Positive.validate(1), true);
    assert.deepEqual(Object.keys(Positive), ['id', 'version']);
    assert.throws(
      () => property.number({ default: -1, policy: Positive }),
      /does not satisfy policy "positive"/
    );
    assert.throws(
      () => property.string({ omitDefault: true }),
      /omitDefault requires a default/
    );
    assert.throws(
      () =>
        property.json({
          default: () => 'not JSON',
        }),
      /must be JSON data/
    );
    assert.throws(
      () => property.json<Date>({ default: new Date(0) }),
      /plain JSON objects/
    );
  });

  it('canonicalizes set defaults with structural item identity', () => {
    const Comments = property.set(property.json<{ id: string }>(), {
      default: [{ id: 'b' }, { id: 'a' }, { id: 'b' }],
      omitDefault: true,
    });

    assert.deepEqual(Comments.default, [{ id: 'a' }, { id: 'b' }]);
    assert.equal(Object.isFrozen(Comments.default), true);
    assert.equal(Object.isFrozen(Comments.default?.[0]), true);
    assert.equal(Comments.equality, 'structural');
    const Nested = property.set(property.set(property.string()), {
      default: [
        ['b', 'a'],
        ['a', 'b'],
      ],
    });

    assert.deepEqual(Nested.default, [['a', 'b']]);
  });

  it('builds a frozen serializable target AST with an implicit primary root', () => {
    const placement = target.and(
      target.types(['quote', 'paragraph', 'paragraph']),
      target.root(),
      target.parent(target.type('section')),
      target.not(target.group('readOnly'))
    );

    assert.equal(Object.isFrozen(placement), true);
    assert.equal(
      placement.kind === 'and' && Object.isFrozen(placement.targets),
      true
    );
    assert.deepEqual(JSON.parse(JSON.stringify(placement)), {
      kind: 'and',
      targets: [
        { kind: 'types', types: ['paragraph', 'quote'] },
        { kind: 'root', root: null },
        { kind: 'parent', target: { kind: 'type', type: 'section' } },
        { kind: 'not', target: { group: 'readOnly', kind: 'group' } },
      ],
    });
    assert.throws(
      // @ts-expect-error the runtime guard also protects untyped JavaScript callers
      () => target.root('main'),
      /Omit the argument for the primary root/
    );
  });

  it('keeps text and element placement laws distinct', () => {
    const Bold = schema.textProperty('bold', property.boolean(), {
      target: target.group('textBlock'),
    });
    const Indent = schema.elementProperty('indent', property.number(), {
      split: 'preserve',
      target: target.group('indentable'),
      typeChange: 'preserve-if-allowed',
    });
    const Suggestions = schema.textProperty(
      schema.key.prefix('suggestion_'),
      property.json<{ id: string }>()
    );

    assert.deepEqual(Bold, {
      inclusive: true,
      key: 'bold',
      placement: 'text',
      split: 'preserve',
      target: { group: 'textBlock', kind: 'group' },
      typeChange: 'drop',
      value: {
        equality: 'structural',
        kind: 'boolean',
        omitDefault: false,
      },
    });
    assert.equal(Indent.placement, 'element');
    assert.equal(Indent.target.kind, 'group');
    assert.deepEqual(Suggestions.key, {
      kind: 'prefix',
      prefix: 'suggestion_',
    });
    assert.equal(Object.isFrozen(Suggestions.key), true);
  });

  it('freezes element shape, owned properties, and slice policy', () => {
    const groups = ['inline'];
    const slice = { preserveContext: true };
    const properties = { alt: property.string({ default: '' }) };
    const Image = element({
      content: schema.content.text({ max: 1, min: 1 }),
      contentRoot: schema.contentRoot({
        content: schema.content.group('block'),
        slot: 'body',
      }),
      groups,
      inline: true,
      properties,
      slice,
      void: 'inline',
    });

    groups.push('mutated');
    slice.preserveContext = false;
    properties.alt = property.string({ default: 'mutated' });

    assert.deepEqual(Image.groups, ['inline']);
    assert.deepEqual(Image.slice, { preserveContext: true });
    assert.equal(Image.properties?.alt.default, '');
    assert.equal(Object.isFrozen(Image), true);
    assert.equal(Object.isFrozen(Image.groups), true);
    assert.equal(Object.isFrozen(Image.properties), true);
    assert.equal(Object.isFrozen(Image.slice), true);
    assert.equal(Object.isFrozen(Image.contentRoot), true);
  });

  it('packages one deeply frozen schema extension and preserves literal types', () => {
    const Paragraph = element({
      content: schema.content.text({ min: 1 }),
      groups: ['articleBlock'],
    });
    const ArticleSchema = defineEditorSchema({
      elements: { paragraph: Paragraph },
      groups: {
        articleBlock: schema.group({ extends: ['block'] }),
      },
      id: 'article',
      properties: [
        schema.textProperty('bold', property.boolean(), {
          target: target.group('textBlock'),
        }),
      ],
      root: schema.root({
        content: schema.content.group('articleBlock', { min: 1 }),
      }),
      roots: {
        comments: schema.root({
          content: schema.content.type('paragraph'),
        }),
      },
      version: 1,
    });
    const extension: EditorExtension = ArticleSchema;
    const extensionInput: EditorExtensionInput = ArticleSchema;
    const slotted = defineExtensionSlot('article-schema').of(ArticleSchema);
    const editor = createEditor({
      extensions: [ArticleSchema],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const id: 'article' = ArticleSchema.schema.id;
    const unknown: 'reject' = ArticleSchema.schema.unknown;
    const type: SchemaElementTypes<typeof ArticleSchema> = 'paragraph';

    assert.equal(id, 'article');
    assert.equal(unknown, 'reject');
    assert.equal(type, 'paragraph');
    assert.equal(extension.name, 'schema:article');
    assert.equal(extensionInput.name, 'schema:article');
    assert.equal(slotted.name, 'slot:article-schema');
    assert.equal(editor.read.children()[0]?.type, 'paragraph');
    assert.equal(Object.isFrozen(ArticleSchema), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema.elements), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema.groups), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema.properties), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema.root), true);
    assert.equal(Object.isFrozen(ArticleSchema.schema.roots), true);
  });

  it('rejects public main roots and malformed cardinality', () => {
    const Paragraph = element({});
    const root = schema.root({ content: schema.content.type('paragraph') });
    const invalidMain = {
      elements: { paragraph: Paragraph },
      id: 'invalid-main',
      root,
      roots: { main: root },
      version: 1,
    } as const;

    assert.throws(
      // @ts-expect-error the primary root belongs in the singular root field
      () => defineEditorSchema(invalidMain),
      /singular root field/
    );
    assert.throws(
      () => schema.content.text({ max: 1, min: 2 }),
      /min cannot exceed max/
    );
  });

  it('preserves composable content grammar and partial contributions', () => {
    const content = schema.content.all(
      [
        schema.content.any([
          schema.content.type('paragraph'),
          schema.content.group('block'),
        ]),
        schema.content.not(schema.content.type('forbidden')),
      ],
      { min: 1 }
    );
    const contribution = schema.contribution({
      elements: {
        paragraph: element({ content: schema.content.text({ min: 1 }) }),
      },
      properties: [schema.textProperty('bold', property.boolean())],
    });
    const extension: EditorExtension = {
      name: 'paragraph-feature',
      schema: contribution,
    };

    assert.deepEqual(content, {
      allowed: {
        kind: 'all',
        rules: [
          {
            kind: 'any',
            rules: [
              { kind: 'type', type: 'paragraph' },
              { group: 'block', kind: 'group' },
            ],
          },
          { kind: 'not', rule: { kind: 'type', type: 'forbidden' } },
        ],
      },
      min: 1,
    });
    assert.equal(extension.schema, contribution);
    assert.equal(Object.isFrozen(content.allowed), true);
    assert.equal(
      content.allowed.kind === 'all' && Object.isFrozen(content.allowed.rules),
      true
    );
    assert.equal(Object.isFrozen(contribution), true);
    assert.equal(Object.isFrozen(contribution.elements), true);
    assert.equal(Object.isFrozen(contribution.properties), true);
  });

  it('preserves unknown elements only when the compiled grammar admits them', () => {
    const OpenSchema = defineEditorSchema({
      elements: {
        container: element({
          content: schema.content.not(schema.content.text()),
        }),
      },
      id: 'open-elements',
      root: schema.root({
        content: schema.content.not(schema.content.text()),
      }),
      unknown: 'preserve',
      version: 1,
    });
    const editor = createEditor({
      extensions: [OpenSchema],
      initialValue: [
        {
          children: [{ text: 'body' }],
          type: 'external',
        },
      ],
    });

    assert.equal(editor.read.children()[0]?.type, 'external');
    assert.equal(
      editor.read.schema.element('container')?.content?.allowsUnknownElements,
      true
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [
            defineEditorSchema({
              elements: { container: element({}) },
              id: 'closed-content',
              root: schema.root({
                content: schema.content.type('container'),
              }),
              unknown: 'preserve',
              version: 1,
            }),
          ],
          initialValue: [{ children: [{ text: 'body' }], type: 'external' }],
        }),
      /cannot contain "external"/
    );
  });

  it('clones and deeply freezes raw structural declaration inputs', () => {
    const rules: SchemaContentRule[] = [{ kind: 'type', type: 'paragraph' }];
    const rawContent = {
      allowed: { kind: 'any' as const, rules },
      min: 1,
    };
    const rawElement = {
      content: rawContent,
      slice: { preserveContext: true },
    };
    const elements: Record<string, SchemaElement> = {
      paragraph: rawElement,
    };
    const FrozenSchema = defineEditorSchema({
      elements,
      id: 'raw-structural-input',
      root: { content: rawContent },
      version: 1,
    });

    rules.push({ kind: 'type', type: 'mutated' });
    rawElement.slice.preserveContext = false;
    elements.heading = {};

    const paragraph = FrozenSchema.schema.elements.paragraph;

    assert.equal(paragraph?.slice?.preserveContext, true);
    assert.equal(
      paragraph?.content?.allowed.kind === 'any' &&
        paragraph.content.allowed.rules.length,
      1
    );
    assert.equal('heading' in FrozenSchema.schema.elements, false);
    assert.equal(Object.isFrozen(paragraph), true);
    assert.equal(Object.isFrozen(paragraph?.content), true);
    assert.equal(Object.isFrozen(paragraph?.content?.allowed), true);
    assert.equal(Object.isFrozen(FrozenSchema.schema.root), true);
  });

  it('traverses frozen declarations instead of trusting their surface', () => {
    const slice = { preserveContext: true };
    const frozenElement = Object.freeze(
      Object.defineProperty({ slice }, 'hidden', {
        enumerable: false,
        value: 'metadata',
      })
    ) as SchemaElement;
    const FrozenSchema = defineEditorSchema({
      elements: { paragraph: frozenElement },
      id: 'frozen-declaration-traversal',
      root: schema.root({ content: schema.content.type('paragraph') }),
      version: 1,
    });

    slice.preserveContext = false;

    assert.equal(
      FrozenSchema.schema.elements.paragraph?.slice?.preserveContext,
      true
    );
    assert.notEqual(FrozenSchema.schema.elements.paragraph, frozenElement);

    const accessor = Object.freeze(
      Object.defineProperty({}, 'hidden', {
        get: () => true,
      })
    );

    assert.throws(
      () =>
        defineEditorSchema({
          elements: { paragraph: accessor as SchemaElement },
          id: 'frozen-accessor',
          root: schema.root({ content: schema.content.type('paragraph') }),
          version: 1,
        }),
      /cannot contain property accessors/
    );

    const nonPlain = Object.freeze(
      Object.defineProperty({ slice: new Date(0) }, 'hidden', {
        value: true,
      })
    );

    assert.throws(
      () =>
        defineEditorSchema({
          elements: { paragraph: nonPlain as unknown as SchemaElement },
          id: 'frozen-nonplain',
          root: schema.root({ content: schema.content.type('paragraph') }),
          version: 1,
        }),
      /plain declaration objects/
    );

    const cycle: Record<string, unknown> = {};

    cycle.self = cycle;
    const cyclic = Object.freeze(
      Object.defineProperty({ slice: cycle }, 'hidden', { value: true })
    );

    assert.throws(
      () =>
        defineEditorSchema({
          elements: { paragraph: cyclic as unknown as SchemaElement },
          id: 'frozen-cycle',
          root: schema.root({ content: schema.content.type('paragraph') }),
          version: 1,
        }),
      /cannot be cyclic/
    );
  });

  typeOnly(() => {
    const root = schema.root({ content: schema.content.text() });

    // @ts-expect-error partial contributions cannot name the primary root
    schema.contribution({ roots: { main: root } });
    definePropertyPolicy<{ id: string }>({
      id: 'unsafe-property-access',
      validate: (value): value is { id: string } => {
        // @ts-expect-error property policies must narrow untrusted values first
        return value.id.length > 0;
      },
      version: 1,
    });
    property.string({
      // @ts-expect-error custom validation belongs in definePropertyPolicy
      validate: (_value: string) => true,
    });
    property.string({
      // @ts-expect-error arbitrary equality callbacks are not schema vocabulary
      equals: (_left: string, _right: string) => true,
    });
    // @ts-expect-error element property registrations require an explicit target
    schema.elementProperty('indent', property.number(), { split: 'preserve' });
    // @ts-expect-error content is grammar vocabulary, not a placement target
    target.content('paragraph');
    element({
      // @ts-expect-error element construction is compiled from schema defaults
      create: () => ({ children: [{ text: '' }], type: 'paragraph' }),
    });
  });
});
