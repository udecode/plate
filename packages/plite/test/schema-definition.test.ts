import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  defineExtension,
  defineExtensionSlot,
  type EditorSchemaContribution,
  type EditorExtensionReference,
  type EditorExtensionInput,
  type PropertyJsonValue,
  type PropertyValueDescriptor,
  type PropertyValueOf,
  property,
  schema,
  type SchemaContentRule,
  type SchemaElement,
  type SchemaElementTypes,
  target,
} from '@platejs/plite';

const typeOnly = (_callback: () => void) => {};

describe('schema declaration builders', () => {
  it('stores schema override sources as stable names', () => {
    const Plugin = Object.freeze({ name: 'card' as const });
    const override = schema.override(Plugin, {
      element: { type: 'customCard' },
    });

    assert.deepEqual(override, {
      element: { type: 'customCard' },
      kind: 'schema-override',
      source: 'card',
    });
    assert.equal(Object.isFrozen(override), true);
    assert.equal(JSON.stringify(override).includes('customCard'), true);
  });

  it('defines frozen structural value laws and versioned inline validation', () => {
    const input = {
      validate: (value: unknown): value is number =>
        typeof value === 'number' && value > 0,
      validationVersion: 2,
    };
    const Width = property.number({
      default: 12,
      omitDefault: true,
      ...input,
    });

    input.validate = (_value): _value is number => false;

    assert.equal(Object.isFrozen(Width), true);
    assert.deepEqual(Width, {
      default: 12,
      kind: 'number',
      omitDefault: true,
      required: false,
      validationVersion: 2,
    });
    assert.deepEqual(JSON.parse(JSON.stringify(Width)), {
      default: 12,
      kind: 'number',
      omitDefault: true,
      required: false,
      validationVersion: 2,
    });
    assert.equal(Width.validate?.('1'), false);
    assert.equal(Width.validate?.(1), true);
    assert.deepEqual(Object.keys(Width), [
      'default',
      'kind',
      'omitDefault',
      'required',
      'validationVersion',
    ]);
    assert.throws(
      () =>
        property.number({
          default: -1,
          validate: (value): value is number =>
            typeof value === 'number' && value > 0,
          validationVersion: 1,
        }),
      /does not satisfy custom validation/
    );
    assert.throws(
      () => property.string({ omitDefault: true }),
      /omitDefault requires a default/
    );
    assert.throws(
      () => property.string({ default: '', required: true }),
      /required cannot be combined with default or omitDefault/
    );
    assert.throws(
      () =>
        property.string({
          default: '',
          omitDefault: true,
          required: true,
        } as never),
      /required cannot be combined with default or omitDefault/
    );
    assert.throws(
      () =>
        property.json({
          default: (() => 'not JSON') as never,
        }),
      /must be JSON data/
    );
    assert.throws(
      () => property.json({ default: new Date(0) as never }),
      /plain JSON objects/
    );
    assert.deepEqual(property.json({ required: true }), {
      kind: 'json',
      omitDefault: false,
      required: true,
    });
  });

  it('keeps runtime generators out of structural declarations', () => {
    const generated = property.string({ generate: () => 'element-1' });

    assert.equal(Object.isFrozen(generated), true);
    assert.equal(generated.generate?.(), 'element-1');
    assert.equal(Object.keys(generated).includes('generate'), false);
    assert.equal(JSON.stringify(generated).includes('generate'), false);
    assert.throws(
      () => property.string({ generate: 'invalid' } as never),
      /generate must be a function/
    );
    assert.throws(
      () => property.string({ default: 'fixed', generate: () => 'new' }),
      /generate cannot be combined with default/
    );
  });

  it('defines literal enum laws with runtime membership validation', () => {
    const Script = property.enum(['sub', 'sup']);

    assert.deepEqual(Script, {
      kind: 'enum',
      omitDefault: false,
      required: false,
      values: ['sub', 'sup'],
    });
    assert.equal(Object.isFrozen(Script), true);
    assert.equal(Object.isFrozen(Script.values), true);
    assert.throws(
      () => property.enum(['sub', 'sub'] as never),
      /values must be unique/
    );
    assert.throws(
      () => property.enum(['sub', 'sup'], { default: 'other' as never }),
      /declared enum value/
    );

    typeOnly(() => {
      const sub: PropertyValueOf<typeof Script> = 'sub';
      const sup: PropertyValueOf<typeof Script> = 'sup';
      // @ts-expect-error enum values stay literal
      const other: PropertyValueOf<typeof Script> = 'other';

      void other;
      void sub;
      void sup;
    });
  });

  it('requires a positive validation version with every inline validator', () => {
    assert.throws(
      () =>
        property.json({
          validate: ((value: unknown): value is string =>
            typeof value === 'string') as never,
        }),
      /validate and validationVersion/
    );
    assert.throws(
      () => property.string({ validationVersion: 1 } as never),
      /validate and validationVersion/
    );
    assert.throws(
      () =>
        property.string({
          validate: ((value: unknown): value is string =>
            typeof value === 'string') as never,
          validationVersion: 0,
        }),
      /positive integer/
    );
  });

  it('canonicalizes set defaults with structural item identity', () => {
    const Comments = property.set(
      property.json({
        validate: (value): value is { id: string } =>
          typeof value === 'object' &&
          value !== null &&
          'id' in value &&
          typeof value.id === 'string',
        validationVersion: 1,
      }),
      {
        default: [{ id: 'b' }, { id: 'a' }, { id: 'b' }],
        omitDefault: true,
      }
    );

    assert.deepEqual(Comments.default, [{ id: 'a' }, { id: 'b' }]);
    assert.equal(Object.isFrozen(Comments.default), true);
    assert.equal(Object.isFrozen(Comments.default?.[0]), true);
    const Nested = property.set(property.set(property.string()), {
      default: [
        ['b', 'a'],
        ['a', 'b'],
      ],
    });

    assert.deepEqual(Nested.default, [['a', 'b']]);
    assert.throws(
      () =>
        property.set(property.string(), {
          default: ['only'],
          validate: (value): value is readonly string[] =>
            Array.isArray(value) && value.length > 1,
          validationVersion: 1,
        }),
      /does not satisfy custom validation/
    );
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
        { kind: 'types', types: ['quote', 'paragraph', 'paragraph'] },
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
      property.json()
    );

    assert.deepEqual(Bold, {
      copy: 'preserve',
      inclusive: true,
      key: 'bold',
      placement: 'text',
      role: 'content',
      split: 'preserve',
      target: { group: 'textBlock', kind: 'group' },
      typeChange: 'drop',
      value: {
        kind: 'boolean',
        omitDefault: false,
        required: false,
      },
    });
    assert.equal(Indent.placement, 'element');
    assert.equal(Indent.copy, 'preserve');
    assert.equal(Indent.role, 'content');
    assert.equal(Indent.target.kind, 'group');
    assert.deepEqual(Suggestions.key, {
      kind: 'prefix',
      prefix: 'suggestion_',
    });
    assert.equal(Object.isFrozen(Suggestions.key), true);
    assert.equal(
      schema.elementProperty('ephemeral', property.string(), {
        copy: 'drop',
        target: target.type('paragraph'),
      }).copy,
      'drop'
    );
    assert.throws(
      () =>
        schema.textProperty(
          'requiredMark',
          property.string({ required: true }),
          // @ts-expect-error required properties must survive copies
          { copy: 'drop' }
        ),
      /required cannot use copy: drop/
    );
    assert.throws(
      () =>
        schema.elementProperty(
          'requiredMetadata',
          property.string({ required: true }),
          // @ts-expect-error required properties must survive copies
          { copy: 'drop', target: target.type('paragraph') }
        ),
      /required cannot use copy: drop/
    );
  });

  it('builds one canonical text-block element without structural escape hatches', () => {
    const textBlock = schema.element.textBlock({
      properties: { align: property.string() },
      slice: { preserveContext: true },
    });

    assert.deepEqual(textBlock, {
      content: {
        allowed: {
          kind: 'any',
          rules: [{ kind: 'text' }, { group: 'inline', kind: 'group' }],
        },
        default: 'text',
        min: 1,
      },
      properties: {
        align: { kind: 'string', omitDefault: false, required: false },
      },
      slice: { preserveContext: true },
    });
    assert.equal(Object.isFrozen(textBlock), true);
    assert.throws(
      () =>
        schema.element.textBlock({
          // @ts-expect-error textBlock owns its content grammar
          content: schema.content.open(),
        }),
      /does not support content/
    );
    assert.throws(
      () =>
        schema.element.textBlock({
          // @ts-expect-error textBlock cannot be void
          void: 'block',
        }),
      /does not support void/
    );
  });

  it('declares frozen exclusive text-property groups', () => {
    const ScriptPosition = schema.property.exclusive('plate:script-position');
    const Subscript = schema.textProperty('subscript', property.boolean(), {
      exclusive: [ScriptPosition],
    });

    assert.deepEqual(ScriptPosition, {
      id: 'plate:script-position',
      kind: 'exclusive',
    });
    assert.equal(Object.isFrozen(ScriptPosition), true);
    assert.deepEqual(Subscript.exclusive, [ScriptPosition]);
    assert.equal(Object.isFrozen(Subscript.exclusive), true);
    assert.throws(
      () => schema.property.exclusive(''),
      /Schema exclusive property group cannot be empty/
    );
  });

  it('freezes raw element shape, content roots, owned properties, and slice policy during normalization', () => {
    const groups = ['inline'];
    const slice = { preserveContext: true };
    const properties: Record<string, PropertyValueDescriptor> = {
      alt: property.string({ default: '' }),
    };
    const image: SchemaElement = {
      content: schema.content.text({ max: 1, min: 1 }),
      contentRoots: { body: schema.content.group('block') },
      groups,
      inline: true,
      properties,
      slice,
    };
    const ImageSchema = defineEditorSchema('schema:image-shape', {
      elements: { image },
      id: 'image-shape',
      root: schema.content.type('image'),
      unknown: 'reject',
      version: 1,
    });

    groups.push('mutated');
    slice.preserveContext = false;
    properties.alt = property.string({ default: 'mutated' });
    const Image = ImageSchema.schema.elements.image!;

    assert.deepEqual(Image.groups, ['inline']);
    assert.deepEqual(Image.slice, { preserveContext: true });
    assert.equal(Image.properties?.alt.default, '');
    assert.equal(Object.isFrozen(Image), true);
    assert.equal(Object.isFrozen(Image.groups), true);
    assert.equal(Object.isFrozen(Image.properties), true);
    assert.equal(Object.isFrozen(Image.slice), true);
    assert.equal(Object.isFrozen(Image.contentRoots), true);
    assert.equal(Object.isFrozen(Image.contentRoots?.body), true);
  });

  it('normalizes omitted complete-schema fields to closed defaults', () => {
    const TextSchema = defineEditorSchema('schema:text-only', {
      id: 'text-only',
      root: schema.content.text(),
      version: 1,
    });
    const unknown: 'reject' = TextSchema.schema.unknown;

    assert.deepEqual(TextSchema.schema.elements, {});
    assert.equal(unknown, 'reject');
    assert.equal(Object.isFrozen(TextSchema.schema.elements), true);
  });

  it('packages one deeply frozen schema extension and preserves literal types', () => {
    const Paragraph = {
      content: schema.content.text({ min: 1 }),
      groups: ['articleBlock'],
    } as const;
    const ArticleSchema = defineEditorSchema('schema:article', {
      elements: { paragraph: Paragraph },
      groups: {
        articleBlock: { extends: ['block'] } as const,
      },
      id: 'article',
      properties: [
        schema.textProperty('bold', property.boolean(), {
          target: target.group('textBlock'),
        }),
      ],
      root: schema.content.group('articleBlock', { min: 1 }),
      roots: {
        comments: schema.content.type('paragraph'),
      },
      unknown: 'reject',
      version: 1,
    });
    const extension: EditorExtensionReference = ArticleSchema;
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
    const Paragraph = { content: schema.content.text() } as const;
    const root = schema.content.type('paragraph');
    const invalidMain = {
      elements: { paragraph: Paragraph },
      id: 'invalid-main',
      root,
      roots: { main: root },
      unknown: 'reject',
      version: 1,
    } as const;

    assert.throws(
      () =>
        createEditor({
          extensions: [
            // @ts-expect-error the primary root belongs in the singular root field
            defineEditorSchema('schema:invalid-main', invalidMain),
          ],
        }),
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
    const contribution = {
      elements: {
        paragraph: { content: schema.content.text({ min: 1 }) },
      },
      properties: [schema.textProperty('bold', property.boolean())],
    } as const;
    const extension: EditorExtensionReference = defineExtension(
      'paragraph-feature',
      {
        schema: contribution,
      }
    );
    const canonicalContribution = extension.schema;

    assert.ok(
      canonicalContribution && typeof canonicalContribution !== 'function'
    );

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
    assert.notEqual(canonicalContribution, contribution);
    assert.equal(Object.isFrozen(content.allowed), true);
    assert.equal(
      content.allowed.kind === 'all' && Object.isFrozen(content.allowed.rules),
      true
    );
    assert.equal(Object.isFrozen(canonicalContribution), true);
    assert.equal(Object.isFrozen(canonicalContribution.elements), true);
    assert.equal(Object.isFrozen(canonicalContribution.properties), true);
  });

  it('preserves unknown elements only when the compiled grammar admits them', () => {
    const OpenSchema = defineEditorSchema('schema:open-elements', {
      elements: {
        container: {
          content: schema.content.open(),
        } as const,
      },
      id: 'open-elements',
      root: schema.content.not(schema.content.text()),
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
            defineEditorSchema('schema:closed-content', {
              elements: {
                container: { content: schema.content.text() },
              },
              id: 'closed-content',
              root: schema.content.type('container'),
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
    const FrozenSchema = defineEditorSchema('schema:raw-structural-input', {
      elements,
      id: 'raw-structural-input',
      root: rawContent,
      unknown: 'reject',
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
    const FrozenSchema = defineEditorSchema(
      'schema:frozen-declaration-traversal',
      {
        elements: { paragraph: frozenElement },
        id: 'frozen-declaration-traversal',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );

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
        defineEditorSchema('schema:frozen-accessor', {
          elements: { paragraph: accessor as SchemaElement },
          id: 'frozen-accessor',
          root: schema.content.type('paragraph'),
          unknown: 'reject',
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
        defineEditorSchema('schema:frozen-nonplain', {
          elements: { paragraph: nonPlain as unknown as SchemaElement },
          id: 'frozen-nonplain',
          root: schema.content.type('paragraph'),
          unknown: 'reject',
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
        defineEditorSchema('schema:frozen-cycle', {
          elements: { paragraph: cyclic as unknown as SchemaElement },
          id: 'frozen-cycle',
          root: schema.content.type('paragraph'),
          unknown: 'reject',
          version: 1,
        }),
      /cannot be cyclic/
    );
  });

  typeOnly(() => {
    const contribution: EditorSchemaContribution = {
      elements: { paragraph: { content: schema.content.text() } },
    };
    const invalidContribution: EditorSchemaContribution = {
      elements: { paragraph: { content: schema.content.text() } },
      // @ts-expect-error partial contributions cannot claim complete identity
      id: 'partial',
    };
    const invalidRootContribution: EditorSchemaContribution = {
      // @ts-expect-error only the complete schema definition owns the primary root
      root: schema.content.text(),
    };
    const payload = property.json({
      validate: (value): value is { id: string } =>
        typeof value === 'object' && value !== null && 'id' in value,
      validationVersion: 1,
    });
    const payloadWithDefault = property.json({
      default: { id: 'default' },
      validate: (value): value is { id: string } =>
        typeof value === 'object' && value !== null && 'id' in value,
      validationVersion: 1,
    });
    const unconstrained = property.json();
    // @ts-expect-error narrow JSON types require a versioned validator
    const explicitJson = property.json<{ id: string }>();
    const inferredJson = property.json({ default: { id: 'json' } });
    const validatedBoolean = property.boolean({
      validate: (value): value is boolean => typeof value === 'boolean',
      validationVersion: 1,
    });
    const validatedNumber = property.number({
      validate: (value): value is number =>
        typeof value === 'number' && value > 0,
      validationVersion: 1,
    });
    const validatedSet = property.set(property.string(), {
      validate: (value): value is readonly string[] =>
        Array.isArray(value) && value.every((item) => typeof item === 'string'),
      validationVersion: 1,
    });
    const validatedString = property.string({
      validate: (value): value is string => typeof value === 'string',
      validationVersion: 1,
    });
    const unconstrainedValue: PropertyValueOf<typeof unconstrained> = {
      id: 'json',
    };
    const inferredJsonValue: PropertyValueOf<typeof inferredJson> = {
      id: 'inferred',
    };
    const broadlyInferredJsonValue: PropertyValueOf<typeof inferredJson> =
      'still-json';
    const jsonValue: PropertyJsonValue = unconstrainedValue;
    const validPayload: PropertyValueOf<typeof payload> = { id: 'ok' };
    const validPayloadWithDefault: PropertyValueOf<typeof payloadWithDefault> =
      { id: 'ok' };
    const exactPayloadId: string = validPayload.id;
    // @ts-expect-error property.json infers its value from the policy
    const invalidPayload: PropertyValueOf<typeof payload> = 'wrong';
    // @ts-expect-error unconstrained property.json still accepts JSON only
    const invalidJson: PropertyValueOf<typeof unconstrained> = () => {};
    // @ts-expect-error explicit no-policy generics must describe JSON values
    property.json<Date>();
    // @ts-expect-error default inference cannot widen no-policy JSON to Date
    property.json({ default: new Date(0) });
    property.json({
      // @ts-expect-error the validator owns TValue; default cannot widen it
      default: 'wrong',
      validate: (value): value is { id: string } =>
        typeof value === 'object' && value !== null && 'id' in value,
      validationVersion: 1,
    });

    void contribution;
    void broadlyInferredJsonValue;
    void explicitJson;
    void exactPayloadId;
    void inferredJsonValue;
    void invalidContribution;
    void invalidJson;
    void invalidRootContribution;
    void invalidPayload;
    void jsonValue;
    void unconstrainedValue;
    void validPayload;
    void validPayloadWithDefault;
    void validatedBoolean;
    void validatedNumber;
    void validatedSet;
    void validatedString;
    property.json({
      validate: (value): value is { id: string } => {
        // @ts-expect-error validators must narrow untrusted values first
        return value.id.length > 0;
      },
      validationVersion: 1,
    });
    // @ts-expect-error validate requires validationVersion
    property.string({
      validate: (value): value is string => typeof value === 'string',
    });
    property.string({
      // @ts-expect-error arbitrary equality callbacks are not schema vocabulary
      equals: (_left: string, _right: string) => true,
    });
    // @ts-expect-error element property registrations require an explicit target
    schema.elementProperty('indent', property.number(), { split: 'preserve' });
    // @ts-expect-error content is grammar vocabulary, not a placement target
    target.content('paragraph');
    const invalidElement: SchemaElement = {
      // @ts-expect-error element construction is compiled from schema defaults
      create: () => ({ children: [{ text: '' }], type: 'paragraph' }),
    };

    void invalidElement;
  });
});
