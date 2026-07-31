import {
  createEditor,
  defineEditorExtension,
  defineEditorSchema,
  defineExtensionSlot,
  property,
  schema,
  type DescendantIn,
  type EditorSchemaProperty,
  type EditorDocumentValue,
  type SchemaContentRootSlotsFor,
  type SchemaElementFor,
  type SchemaElementInput,
  type SchemaElementPropertiesFor,
  type SchemaElementPropertyKeys,
  type SchemaElementTypes,
  type SchemaGroupNames,
  type SchemaGroupOptions,
  type SchemaPropertyIds,
  type SchemaRootNames,
  type SchemaTarget,
  type SchemaText,
  type SchemaTextPropertyKeys,
  type SchemaValue,
  target,
  type ValueOf,
} from '@platejs/plite';

const ArticleSchema = defineEditorSchema({
  elements: {
    heading: {
      content: schema.content.text({ min: 1 }),
      properties: { level: property.number() },
    } as const,
    paragraph: {
      content: schema.content.text({ min: 1 }),
      properties: { align: property.string() },
    } as const,
  },
  id: 'schema-inference-contract',
  properties: [
    schema.elementProperty('shared', property.boolean(), {
      target: target.group('block'),
    }),
    schema.elementProperty('headingOnly', property.number(), {
      target: target.type('heading'),
    }),
    schema.textProperty('bold', property.boolean()),
    schema.textProperty(schema.key.prefix('comment_'), property.string()),
  ],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: {
    comments: schema.content.type('paragraph'),
  },
  unknown: 'reject',
  version: 1,
});

const ContentRootSchema = defineEditorSchema({
  contentRoots: [
    {
      content: schema.content.type('paragraph'),
      ownership: 'shared',
      slot: 'preview',
      target: target.type('image'),
    },
  ],
  elements: {
    image: {
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph'),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  root: schema.content.type('image'),
  unknown: 'reject',
});

const contentRootSlot: SchemaContentRootSlotsFor<
  typeof ContentRootSchema,
  'image'
> = 'caption';
const rootedImage: SchemaElementFor<typeof ContentRootSchema, 'image'> = {
  childRoots: { caption: 'caption:1', preview: 'preview:1' },
  children: [{ text: '' }],
  type: 'image',
};
const missingRootedImage: SchemaElementFor<typeof ContentRootSchema, 'image'> =
  {
    // @ts-expect-error every inferred content-root slot is required
    childRoots: { caption: 'caption:1' },
    children: [{ text: '' }],
    type: 'image',
  };
const unknownRootedImage: SchemaElementFor<typeof ContentRootSchema, 'image'> =
  {
    childRoots: {
      caption: 'caption:1',
      // @ts-expect-error undeclared content-root slots are rejected
      notes: 'notes:1',
      preview: 'preview:1',
    },
    children: [{ text: '' }],
    type: 'image',
  };

const dynamicTargetGroup: string = 'custom';
const dynamicTargetType: string = 'heading';
const dynamicTargetTypes: readonly string[] = ['heading'];
declare const runtimeCondition: boolean;
const finiteTargetGroup: 'custom' | 'other' = runtimeCondition
  ? 'custom'
  : 'other';
const finiteTargetType: 'heading' | 'paragraph' = runtimeCondition
  ? 'heading'
  : 'paragraph';
const finiteTargetTypes = runtimeCondition
  ? (['heading'] as const)
  : (['paragraph'] as const);
const widenedTargets: readonly [SchemaTarget, SchemaTarget] = [
  target.type('heading'),
  target.type('paragraph'),
];

const UnsupportedDepthSchema = defineEditorSchema({
  elements: {
    heading: { content: schema.content.text() },
    paragraph: {
      content: schema.content.text(),
      groups: ['custom'],
    },
  },
  groups: { custom: {}, other: {} },
  id: 'schema-inference-unsupported-target-depth',
  properties: [
    schema.elementProperty('deep', property.boolean(), {
      target: target.not(
        target.not(
          target.not(
            target.not(
              target.not(
                target.not(target.not(target.not(target.type('heading'))))
              )
            )
          )
        )
      ),
    }),
    schema.elementProperty('dynamicGroup', property.boolean(), {
      target: target.group(dynamicTargetGroup),
    }),
    schema.elementProperty('dynamicOr', property.boolean(), {
      target: target.or(...widenedTargets),
    }),
    schema.elementProperty('dynamicType', property.boolean(), {
      target: target.type(dynamicTargetType),
    }),
    schema.elementProperty('dynamicTypes', property.boolean(), {
      target: target.types(dynamicTargetTypes),
    }),
    schema.elementProperty('finiteGroup', property.boolean(), {
      target: target.group(finiteTargetGroup),
    }),
    schema.elementProperty('finiteType', property.boolean(), {
      target: target.type(finiteTargetType),
    }),
    schema.elementProperty('finiteTypes', property.boolean(), {
      target: target.types(finiteTargetTypes),
    }),
    schema.elementProperty('literalTypes', property.boolean(), {
      target: target.types(['heading', 'paragraph'] as const),
    }),
  ],
  root: schema.content.types(['heading', 'paragraph']),
  unknown: 'reject',
  version: 1,
});

const unsupportedDepthParagraph: SchemaElementFor<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = {
  children: [{ text: '' }],
  // @ts-expect-error inference never claims a property when target depth is unsupported
  deep: true,
  type: 'paragraph',
};

// Dynamic target inputs are runtime-only facts, never statically claimed keys.
// @ts-expect-error a widened group cannot prove property applicability
const invalidDynamicGroupKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicGroup';
// @ts-expect-error widened combinator children cannot prove applicability
const invalidDynamicOrKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicOr';
// @ts-expect-error a widened type cannot prove property applicability
const invalidDynamicTypeKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicType';
// @ts-expect-error widened types cannot prove property applicability
const invalidDynamicTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicTypes';
// @ts-expect-error a runtime union group cannot prove applicability
const invalidFiniteGroupKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteGroup';
// @ts-expect-error a runtime union type cannot prove applicability
const invalidFiniteTypeKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteType';
// @ts-expect-error a runtime union types list cannot prove applicability
const invalidFiniteTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteTypes';
const validLiteralTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'literalTypes';

const dynamicInline = true as boolean;
const dynamicVoid = 'block' as NonNullable<SchemaElementInput['void']>;
const dynamicGroups = ['custom'] as readonly string[];
const dynamicParents = ['custom'] as readonly string[];
const finiteGroups = runtimeCondition
  ? (['custom'] as const)
  : (['other'] as const);
const finiteParents = runtimeCondition
  ? (['custom'] as const)
  : (['other'] as const);
const conditionalGroupsElement = runtimeCondition
  ? ({ content: schema.content.text(), groups: ['custom'] } as const)
  : ({ content: schema.content.text() } as const);
const conditionalInlineElement = runtimeCondition
  ? ({ content: schema.content.text(), inline: true } as const)
  : ({ content: schema.content.text() } as const);
const fullyWidenedElement: SchemaElementInput = {
  content: schema.content.text(),
  groups: ['custom'],
  inline: true,
};
const fullyWidenedGroup: SchemaGroupOptions = { extends: ['custom'] };
const WidenedElementSchema = defineEditorSchema({
  elements: {
    dynamicGroups: {
      content: schema.content.text(),
      groups: dynamicGroups,
    },
    conditionalGroups: conditionalGroupsElement,
    conditionalInline: conditionalInlineElement,
    finiteGroups: {
      content: schema.content.text(),
      groups: finiteGroups,
    },
    finiteParents: {
      content: schema.content.text(),
      groups: ['finiteChild'],
    },
    dynamicInline: {
      content: schema.content.text(),
      inline: dynamicInline,
    },
    dynamicParents: {
      content: schema.content.text(),
      groups: ['child'],
    },
    dynamicVoid: { void: dynamicVoid },
    wholeGroup: {
      content: schema.content.text(),
      groups: ['wholeChild'],
    },
    wholeInput: fullyWidenedElement,
  },
  groups: {
    child: { extends: dynamicParents },
    custom: {},
    finiteChild: { extends: finiteParents },
    other: {},
    wholeChild: fullyWidenedGroup,
  },
  id: 'schema-inference-widened-element-facts',
  properties: [
    schema.elementProperty('blockOnly', property.boolean(), {
      target: target.group('block'),
    }),
    schema.elementProperty('inlineOnly', property.boolean(), {
      target: target.group('inline'),
    }),
    schema.elementProperty('notCustom', property.boolean(), {
      target: target.not(target.group('custom')),
    }),
  ],
  root: schema.content.open(),
  unknown: 'reject',
  version: 1,
});

// @ts-expect-error widened inline behavior cannot prove block membership
const invalidDynamicInlineBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicInline'
> = 'blockOnly';
// @ts-expect-error widened inline behavior cannot prove inline membership
const invalidDynamicInlineInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicInline'
> = 'inlineOnly';
// @ts-expect-error widened void behavior cannot prove block membership
const invalidDynamicVoidBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicVoid'
> = 'blockOnly';
// @ts-expect-error widened void behavior cannot prove inline membership
const invalidDynamicVoidInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicVoid'
> = 'inlineOnly';
// @ts-expect-error widened direct groups cannot prove a negative target
const invalidDynamicGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicGroups'
> = 'notCustom';
// @ts-expect-error widened parent groups cannot prove a negative target
const invalidDynamicParentsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicParents'
> = 'notCustom';
// @ts-expect-error a wholly widened element cannot prove block membership
const invalidWholeInputBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeInput'
> = 'blockOnly';
// @ts-expect-error a wholly widened element cannot prove a negative target
const invalidWholeInputNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeInput'
> = 'notCustom';
// @ts-expect-error a wholly widened group cannot prove a negative target
const invalidWholeGroupNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeGroup'
> = 'notCustom';
// @ts-expect-error a conditional inline declaration cannot prove block membership
const invalidConditionalInlineBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalInline'
> = 'blockOnly';
// @ts-expect-error a conditional inline declaration cannot prove inline membership
const invalidConditionalInlineInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalInline'
> = 'inlineOnly';
// @ts-expect-error conditional groups cannot prove a negative target
const invalidConditionalGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalGroups'
> = 'notCustom';
// @ts-expect-error a runtime union group list cannot prove a negative target
const invalidFiniteGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'finiteGroups'
> = 'notCustom';
// @ts-expect-error a runtime union parent list cannot prove a negative target
const invalidFiniteParentsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'finiteParents'
> = 'notCustom';

const elementType: SchemaElementTypes<typeof ArticleSchema> = 'heading';
const groupName: SchemaGroupNames<typeof ArticleSchema> = 'block';
const builtInGroupName: SchemaGroupNames<typeof ArticleSchema> = 'textBlock';
const rootName: SchemaRootNames<typeof ArticleSchema> = 'comments';
const paragraphKey: SchemaElementPropertyKeys<
  typeof ArticleSchema,
  'paragraph'
> = 'align';
const headingProperties: SchemaElementPropertiesFor<
  typeof ArticleSchema,
  'heading'
> = { headingOnly: 2, level: 1, shared: true };
const textKey: SchemaTextPropertyKeys<typeof ArticleSchema> = 'comment_note';
const text: SchemaText<typeof ArticleSchema> = {
  bold: true,
  comment_note: 'thread',
  text: 'typed',
};
const propertyIds: SchemaPropertyIds<typeof ArticleSchema>[] = [
  'element:align@hash',
  'element:headingOnly@hash',
  'text:bold@hash',
  'text:comment_*@hash',
];
const value: SchemaValue<typeof ArticleSchema> = [
  { align: 'start', children: [text], shared: true, type: 'paragraph' },
];

const invalidType: SchemaValue<typeof ArticleSchema> = [
  // @ts-expect-error only declared element types belong to the schema value
  { children: [{ text: '' }], type: 'unknown' },
];

const invalidElementProperty: SchemaElementFor<
  typeof ArticleSchema,
  'paragraph'
> = {
  children: [{ text: '' }],
  // @ts-expect-error heading-only properties do not belong to paragraphs
  headingOnly: 1,
  type: 'paragraph',
};

const invalidElementPropertyValue: SchemaElementFor<
  typeof ArticleSchema,
  'heading'
> = {
  children: [{ text: '' }],
  // @ts-expect-error local element properties retain their descriptor type
  level: 'one',
  type: 'heading',
};

const invalidTextPropertyValue: SchemaText<typeof ArticleSchema> = {
  // @ts-expect-error exact text properties retain their descriptor type
  bold: 'yes',
  text: '',
};

// @ts-expect-error prefix declarations accept only their template-key pattern
const invalidTextPrefix: SchemaTextPropertyKeys<typeof ArticleSchema> =
  'note_comment';

// @ts-expect-error property IDs retain placement and prefix vocabulary
const invalidPropertyId: SchemaPropertyIds<typeof ArticleSchema> =
  'element:comment_*@hash';

const editor = createEditor({
  extensions: [ArticleSchema],
  initialValue: [
    { align: 'start', children: [{ text: 'paragraph' }], type: 'paragraph' },
  ],
});

const assertExternalSchemaValues = (
  schemaApi: typeof editor.read.schema,
  document: unknown,
  fragment: unknown
) => {
  schemaApi.assertDocument(document);
  schemaApi.assertFragment(fragment);

  const assertedDocument: EditorDocumentValue<ValueOf<typeof editor>> =
    document;
  const assertedFragment: readonly DescendantIn<ValueOf<typeof editor>>[] =
    fragment;

  void assertedDocument;
  void assertedFragment;
};

void assertExternalSchemaValues;

const paragraphHandle = schema.handle.element(ArticleSchema, 'paragraph');
const alignHandle = schema.handle.property(paragraphHandle, 'align');
const handledParagraph = editor.read.schema.create(paragraphHandle, {
  align: 'center',
  shared: true,
});
const handledAlign: string | undefined = editor.read.schema.getElementProperty(
  handledParagraph,
  alignHandle
);
const handledAlignProperty: EditorSchemaProperty | null =
  editor.read.schema.property(alignHandle);
const exactHandledParagraph: SchemaElementFor<
  typeof ArticleSchema,
  'paragraph'
> = handledParagraph;

const assertSchemaHandleTypes = () => {
  // @ts-expect-error handles reject undeclared element types
  schema.handle.element(ArticleSchema, 'unknown');
  // @ts-expect-error property handles reject keys unavailable on the element
  schema.handle.property(paragraphHandle, 'headingOnly');
  // @ts-expect-error handle-owned element properties retain their value type
  editor.read.schema.create(paragraphHandle, { align: 1 });
};

void assertSchemaHandleTypes;
void handledAlignProperty;

const factoryOptions = {
  nested: { enabled: true },
  types: ['callout'],
} as const;
const FactoryContribution = defineEditorExtension({
  name: 'schema-inference-factory-contribution',
  schema(context) {
    const hasOnlyName: [Exclude<keyof typeof context, 'name'>] extends [never]
      ? true
      : false = true;
    const hasName: [Exclude<'name', keyof typeof context>] extends [never]
      ? true
      : false = true;

    void hasOnlyName;
    void hasName;
    void context.name;
    // @ts-expect-error schema factories do not receive plugin config
    void context.config;
    // @ts-expect-error schema factories do not receive plugin state
    void context.state;
    // @ts-expect-error schema factories receive no editor capability
    void context.editor;

    const assertReadonlyConfig = () => {
      // @ts-expect-error owner options remain deeply readonly
      factoryOptions.nested.enabled = false;
      // @ts-expect-error owner option arrays remain deeply readonly
      factoryOptions.types.push('paragraph');
    };

    void assertReadonlyConfig;

    return {
      elements: {
        callout: {
          content: schema.content.text(),
          properties: { tone: property.string() },
        },
      },
    } as const;
  },
});
const composedEditor = createEditor({
  extensions: [ArticleSchema, FactoryContribution] as const,
  initialValue: [
    { children: [{ text: 'typed contribution' }], type: 'callout' },
  ],
});
const calloutHandle = schema.handle.element(FactoryContribution, 'callout');
const toneHandle = schema.handle.property(calloutHandle, 'tone');
const handledCallout = composedEditor.read.schema.create(calloutHandle, {
  tone: 'notice',
});
const handledTone: string | undefined =
  composedEditor.read.schema.getElementProperty(handledCallout, toneHandle);
const composedCallout: ReturnType<typeof composedEditor.read.children>[number] =
  {
    children: [{ text: '' }],
    tone: 'notice',
    type: 'callout',
  };
const invalidComposedCallout: ReturnType<
  typeof composedEditor.read.children
>[number] = {
  children: [{ text: '' }],
  // @ts-expect-error partial contribution properties retain their descriptor type
  tone: 1,
  type: 'callout',
};

editor.read.schema.property({
  key: 'bold',
  placement: 'text',
  root: 'comments',
  type: 'paragraph',
});
const assertPrimaryRootType = () => {
  // @ts-expect-error the primary schema root is implicit
  editor.read.schema.property({ key: 'x', placement: 'text', root: 'main' });
};

void assertPrimaryRootType;

const child = editor.read.children()[0];
const siblingHeading: typeof child = {
  children: [{ bold: true, text: 'heading' }],
  headingOnly: 2,
  level: 1,
  type: 'heading',
};
const entry = editor.read.nodes.find();
const marks = editor.read.marks();

if (entry) {
  const inferredNode:
    | SchemaElementFor<typeof ArticleSchema>
    | SchemaText<typeof ArticleSchema> = entry[0];

  void inferredNode;
}

if (marks) {
  const bold: boolean | undefined = marks.bold;
  const comment: string | undefined = marks.comment_thread;

  // @ts-expect-error element properties are not text marks
  marks.align;
  void bold;
  void comment;
}

const assertEditorUpdateTypes = () => {
  editor.update((tx) => {
    tx.nodes.insert(siblingHeading);
    tx.fragment.replace([siblingHeading]);
    tx.selection.set({ offset: 0, path: [0, 0] });
    // @ts-expect-error wrong mark values are rejected
    tx.marks.set({ bold: 'yes' });
  });
};

void assertEditorUpdateTypes;
void invalidDynamicGroupKey;
void invalidDynamicGroupsNotKey;
void invalidDynamicInlineBlockKey;
void invalidDynamicInlineInlineKey;
void invalidDynamicOrKey;
void invalidDynamicParentsNotKey;
void invalidDynamicTypeKey;
void invalidDynamicTypesKey;
void invalidDynamicVoidBlockKey;
void invalidDynamicVoidInlineKey;
void invalidConditionalGroupsNotKey;
void invalidConditionalInlineBlockKey;
void invalidConditionalInlineInlineKey;
void invalidFiniteGroupKey;
void invalidFiniteGroupsNotKey;
void invalidFiniteParentsNotKey;
void invalidFiniteTypeKey;
void invalidFiniteTypesKey;
void invalidWholeInputBlockKey;
void invalidWholeInputNotKey;
void invalidWholeGroupNotKey;
void validLiteralTypesKey;
void unsupportedDepthParagraph;

const slottedEditor = createEditor({
  extensions: [defineExtensionSlot('article-schema').of(ArticleSchema)],
  initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
});
const slottedChildren = slottedEditor.read.children();
const slottedHeading: (typeof slottedChildren)[number] = {
  children: [{ text: '' }],
  level: 2,
  type: 'heading',
};

type CustomValue = {
  children: { custom: true; text: string }[];
  type: 'custom';
}[];

const explicitEditor = createEditor<CustomValue>({
  initialValue: [{ children: [{ custom: true, text: '' }], type: 'custom' }],
});
const inferredRawEditor = createEditor({
  initialValue: [{ children: [{ custom: true, text: '' }], type: 'custom' }],
});
const explicitValue: readonly CustomValue[number][] =
  explicitEditor.read.children();
const inferredCustom: boolean =
  inferredRawEditor.read.children()[0]!.children[0]!.custom;

type WiderValue = (
  | SchemaElementFor<typeof ArticleSchema>
  | { children: { legacy: true; text: string }[]; type: 'legacy' }
)[];

const articleExtensions = [ArticleSchema] as const;

const assertWiderValueType = () => {
  const widerEditor = createEditor<WiderValue, typeof articleExtensions>({
    extensions: articleExtensions,
    initialValue: [{ children: [{ legacy: true, text: '' }], type: 'legacy' }],
  });
  const widerValue: readonly WiderValue[number][] = widerEditor.read.children();

  void widerValue;
};

void assertWiderValueType;

const PreserveSchema = defineEditorSchema({
  elements: {
    paragraph: {
      properties: { count: property.number() },
    } as const,
  },
  id: 'schema-inference-preserve-contract',
  root: schema.content.type('paragraph'),
  unknown: 'preserve',
  version: 1,
});
const preservedKnown: SchemaValue<typeof PreserveSchema> = [
  { children: [{ text: '' }], count: 1, type: 'paragraph' },
];
const preservedUnknown: SchemaValue<typeof PreserveSchema> = [
  {
    arbitrary: { nested: true },
    children: [{ external: 'value', text: '' }],
    type: 'external',
  },
];
const preservedWrongKnownProperty: SchemaValue<typeof PreserveSchema> = [
  {
    children: [{ text: '' }],
    // @ts-expect-error declared property values stay exact under preserve
    count: 'one',
    type: 'paragraph',
  },
];

void elementType;
void builtInGroupName;
void contentRootSlot;
void explicitValue;
void groupName;
void headingProperties;
void handledAlign;
void handledCallout;
void handledTone;
void exactHandledParagraph;
void inferredCustom;
void invalidElementProperty;
void invalidElementPropertyValue;
void invalidPropertyId;
void invalidTextPrefix;
void invalidTextPropertyValue;
void invalidType;
void missingRootedImage;
void paragraphKey;
void propertyIds;
void preservedKnown;
void preservedUnknown;
void preservedWrongKnownProperty;
void composedCallout;
void invalidComposedCallout;
void rootName;
void rootedImage;
void siblingHeading;
void slottedHeading;
void textKey;
void unknownRootedImage;
void value;
