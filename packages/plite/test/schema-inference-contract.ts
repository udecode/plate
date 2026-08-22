import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  defineExtensionSlot,
  type Descendant,
  NodeApi,
  property,
  schema,
  type DescendantIn,
  type EditorSchemaProperty,
  type EditorDocumentValue,
  type SchemaContentRootSlotsFor,
  type SchemaElementFor,
  type SchemaElementConstructionPropertiesFor,
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

const ArticleSchema = defineEditorSchema('schema:schema-inference-contract', {
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

const ContentRootSchema = defineEditorSchema('schema:derived', {
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

const RelationshipSchema = defineEditorSchema('schema:relationship-contract', {
  elements: {
    cell: {
      content: schema.content.type('paragraph'),
      properties: { colSpan: property.number({ default: 1 }) },
    },
    paragraph: {
      content: schema.content.text(),
      properties: {
        align: property.string({ default: 'start', omitDefault: true }),
      },
    },
    recursive: {
      content: schema.content.any([
        schema.content.text(),
        schema.content.type('recursive'),
      ]),
    },
    row: { content: schema.content.type('cell') },
    table: {
      content: schema.content.type('row'),
      properties: { id: property.string({ required: true }) },
    },
  },
  properties: [
    schema.elementProperty('mainOnly', property.boolean(), {
      target: target.and(target.type('table'), target.root()),
    }),
    schema.elementProperty('rowContext', property.boolean(), {
      target: target.and(
        target.type('cell'),
        target.parent(target.type('row'))
      ),
    }),
    schema.textProperty('cellText', property.boolean(), {
      target: target.and(
        target.type('paragraph'),
        target.parent(target.type('cell'))
      ),
    }),
    schema.textProperty('requiredMark', property.boolean({ required: true }), {
      target: target.type('paragraph'),
    }),
    schema.textProperty('tone', property.string({ default: 'normal' }), {
      target: target.type('paragraph'),
    }),
  ],
  root: schema.content.any([
    schema.content.type('table'),
    schema.content.all([
      schema.content.group('block'),
      schema.content.not(
        schema.content.types(['cell', 'paragraph', 'row', 'table'])
      ),
    ]),
  ]),
  unknown: 'reject',
});

const relationshipValue: SchemaValue<typeof RelationshipSchema> = [
  {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    cellText: true,
                    requiredMark: true,
                    text: '',
                    tone: 'normal',
                  },
                ],
                type: 'paragraph',
              },
            ],
            colSpan: 1,
            rowContext: true,
            type: 'cell',
          },
        ],
        type: 'row',
      },
    ],
    id: 'table-1',
    mainOnly: true,
    type: 'table',
  },
];
// Static values expose the installed vocabulary; runtime schema rejects this
// row at the document root.
const relationshipRootVocabulary: SchemaValue<typeof RelationshipSchema> = [
  { children: [], type: 'row' },
];
// Runtime schema rejects a cell directly under a table.
const relationshipChildVocabulary: SchemaValue<typeof RelationshipSchema> = [
  {
    children: [{ children: [], colSpan: 1, type: 'cell' }],
    id: 'table-1',
    type: 'table',
  },
];
const invalidMissingRequiredTableProperty: SchemaValue<
  typeof RelationshipSchema
> = [
  // @ts-expect-error canonical table nodes require explicit required properties
  { children: [], type: 'table' },
];
// @ts-expect-error non-omitted defaults are present in canonical outputs
const invalidMissingDefaultedCellProperty: SchemaElementFor<
  typeof RelationshipSchema,
  'cell'
> = {
  children: [],
  type: 'cell',
};
const standaloneParagraph: SchemaElementFor<
  typeof RelationshipSchema,
  'paragraph'
> = {
  children: [{ requiredMark: true, text: '', tone: 'normal' }],
  type: 'paragraph',
};
const possibleContextualParagraph: SchemaElementFor<
  typeof RelationshipSchema,
  'paragraph'
> = {
  children: [
    {
      // Parent-targeted placement is runtime-owned, so the property is optional
      // in the installed text vocabulary.
      cellText: true,
      requiredMark: true,
      text: '',
      tone: 'normal',
    },
  ],
  type: 'paragraph',
};
const recursiveValue: SchemaValue<typeof RelationshipSchema> = [
  {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          { children: [{ text: 'deep' }], type: 'recursive' },
                        ],
                        type: 'recursive',
                      },
                    ],
                    type: 'recursive',
                  },
                ],
                type: 'recursive',
              },
            ],
            type: 'recursive',
          },
        ],
        type: 'recursive',
      },
    ],
    type: 'recursive',
  },
];

const relationshipEditor = createEditor({ extensions: [RelationshipSchema] });
const tableHandle = schema.handle.element(RelationshipSchema, 'table');
const cellHandle = schema.handle.element(RelationshipSchema, 'cell');
const createdTable = relationshipEditor.read.schema.create(tableHandle, {
  id: 'table-1',
});
const createdCell = relationshipEditor.read.schema.create(cellHandle);
const createdColSpan: number = createdCell.colSpan;
const assertRequiredConstruction = () => {
  // @ts-expect-error required properties without defaults are construction inputs
  relationshipEditor.read.schema.create(tableHandle);
};

void assertRequiredConstruction;
void createdColSpan;
void createdTable;
void invalidMissingDefaultedCellProperty;
void invalidMissingRequiredTableProperty;
void possibleContextualParagraph;
void relationshipChildVocabulary;
void relationshipRootVocabulary;
void recursiveValue;
void relationshipValue;
void standaloneParagraph;

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

const UnsupportedDepthSchema = defineEditorSchema(
  'schema:schema-inference-unsupported-target-depth',
  {
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
  }
);

const unsupportedDepthParagraph: SchemaElementFor<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = {
  children: [{ text: '' }],
  type: 'paragraph',
};
const supportedDeepHeading: SchemaElementFor<
  typeof UnsupportedDepthSchema,
  'heading'
> = {
  children: [{ text: '' }],
  deep: true,
  type: 'heading',
};

// Dynamic target inputs expose possible keys; runtime schema owns placement.
const possibleDynamicGroupKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicGroup';
const possibleDynamicOrKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicOr';
const possibleDynamicTypeKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicType';
const possibleDynamicTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'dynamicTypes';
const possibleFiniteGroupKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteGroup';
const possibleFiniteTypeKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteType';
const possibleFiniteTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'finiteTypes';
const validLiteralTypesKey: SchemaElementPropertyKeys<
  typeof UnsupportedDepthSchema,
  'paragraph'
> = 'literalTypes';
const possibleDynamicDocument: SchemaValue<typeof UnsupportedDepthSchema> = [
  {
    children: [{ text: '' }],
    dynamicGroup: true,
    dynamicOr: true,
    dynamicType: true,
    dynamicTypes: true,
    type: 'paragraph',
  },
];

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
const WidenedElementSchema = defineEditorSchema(
  'schema:schema-inference-widened-element-facts',
  {
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
  }
);

const possibleDynamicInlineBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicInline'
> = 'blockOnly';
const possibleDynamicInlineInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicInline'
> = 'inlineOnly';
const possibleDynamicVoidBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicVoid'
> = 'blockOnly';
const possibleDynamicVoidInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicVoid'
> = 'inlineOnly';
const possibleDynamicGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicGroups'
> = 'notCustom';
const possibleDynamicParentsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'dynamicParents'
> = 'notCustom';
const possibleWholeInputBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeInput'
> = 'blockOnly';
const possibleWholeInputNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeInput'
> = 'notCustom';
const possibleWholeGroupNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'wholeGroup'
> = 'notCustom';
const possibleConditionalInlineBlockKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalInline'
> = 'blockOnly';
const possibleConditionalInlineInlineKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalInline'
> = 'inlineOnly';
const possibleConditionalGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'conditionalGroups'
> = 'notCustom';
const possibleFiniteGroupsNotKey: SchemaElementPropertyKeys<
  typeof WidenedElementSchema,
  'finiteGroups'
> = 'notCustom';
const possibleFiniteParentsNotKey: SchemaElementPropertyKeys<
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
const GeneratedSchema = defineEditorSchema('schema:generated-inference', {
  elements: {
    paragraph: {
      content: schema.content.text(),
      properties: {
        id: property.string({ generate: () => 'generated' }),
      },
    },
  },
  root: schema.content.type('paragraph'),
});
const generatedCanonical: SchemaElementPropertiesFor<
  typeof GeneratedSchema,
  'paragraph'
> = { id: 'generated' };
const generatedConstruction: SchemaElementConstructionPropertiesFor<
  typeof GeneratedSchema,
  'paragraph'
> = {};
const textKey: SchemaTextPropertyKeys<typeof ArticleSchema> = 'comment_note';
const text: SchemaText<typeof ArticleSchema> = {
  bold: true,
  comment_note: 'thread',
  text: 'typed',
};
const propertyIds: Array<SchemaPropertyIds<typeof ArticleSchema>> = [
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
  const assertedFragment: ReadonlyArray<DescendantIn<ValueOf<typeof editor>>> =
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
const handledAlign: string | undefined = editor.read.schema.getProperty(
  handledParagraph,
  alignHandle
);
const handledAlignProperty: EditorSchemaProperty | null =
  editor.read.schema.property(alignHandle);
editor.update((tx) => {
  tx.nodes.set({ [alignHandle.key]: 'end' });
  tx.nodes.set({ [alignHandle.key]: undefined });
  tx.nodes.set({ align: undefined });
  // @ts-expect-error handle-owned mutations retain their value type
  tx.nodes.set({ [alignHandle.key]: 1 });
});
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
const FactoryContribution = defineExtension(
  'schema-inference-factory-contribution',
  {
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
  }
);
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
const handledTone: string | undefined = composedEditor.read.schema.getProperty(
  handledCallout,
  toneHandle
);
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

if (entry && NodeApi.isDescendant(entry[0])) {
  const inferredNode: Descendant = entry[0];

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
void possibleDynamicGroupKey;
void possibleDynamicGroupsNotKey;
void possibleDynamicInlineBlockKey;
void possibleDynamicInlineInlineKey;
void possibleDynamicOrKey;
void possibleDynamicParentsNotKey;
void possibleDynamicTypeKey;
void possibleDynamicTypesKey;
void possibleDynamicVoidBlockKey;
void possibleDynamicVoidInlineKey;
void possibleConditionalGroupsNotKey;
void possibleConditionalInlineBlockKey;
void possibleConditionalInlineInlineKey;
void possibleFiniteGroupKey;
void possibleFiniteGroupsNotKey;
void possibleFiniteParentsNotKey;
void possibleFiniteTypeKey;
void possibleFiniteTypesKey;
void possibleWholeInputBlockKey;
void possibleWholeInputNotKey;
void possibleWholeGroupNotKey;
void validLiteralTypesKey;
void possibleDynamicDocument;
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

type CustomValue = Array<{
  children: Array<{ custom: true; text: string }>;
  type: 'custom';
}>;

const explicitEditor = createEditor<CustomValue>({
  initialValue: [{ children: [{ custom: true, text: '' }], type: 'custom' }],
});
const inferredRawEditor = createEditor({
  initialValue: [{ children: [{ custom: true, text: '' }], type: 'custom' }],
});
const explicitValue: ReadonlyArray<CustomValue[number]> =
  explicitEditor.read.children();
const inferredCustom: boolean =
  inferredRawEditor.read.children()[0].children[0].custom;

type WiderValue = Array<
  | SchemaElementFor<typeof ArticleSchema>
  | { children: Array<{ legacy: true; text: string }>; type: 'legacy' }
>;

const articleExtensions = [ArticleSchema] as const;

const assertWiderValueType = () => {
  const widerEditor = createEditor<WiderValue, typeof articleExtensions>({
    extensions: articleExtensions,
    initialValue: [{ children: [{ legacy: true, text: '' }], type: 'legacy' }],
  });
  const widerValue: ReadonlyArray<WiderValue[number]> =
    widerEditor.read.children();

  void widerValue;
};

void assertWiderValueType;

const PreserveSchema = defineEditorSchema(
  'schema:schema-inference-preserve-contract',
  {
    elements: {
      paragraph: {
        properties: { count: property.number() },
      } as const,
    },
    id: 'schema-inference-preserve-contract',
    root: schema.content.type('paragraph'),
    unknown: 'preserve',
    version: 1,
  }
);
const preservedKnown: SchemaValue<typeof PreserveSchema> = [
  { children: [{ text: '' }], count: 1, type: 'paragraph' },
];
const preservedUnknown: SchemaValue<typeof PreserveSchema> = [
  {
    arbitrary: { nested: true },
    children: [{ external: 'value', text: '' }],
    // The value vocabulary preserves unknown nodes. Runtime root validation
    // still rejects this node in the closed paragraph-only root.
    type: 'external',
  },
];
const OpenPreserveSchema = defineEditorSchema('schema:open-preserve-contract', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  root: schema.content.open(),
  unknown: 'preserve',
});
const preservedOpenUnknown: SchemaValue<typeof OpenPreserveSchema> = [
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
void generatedCanonical;
void generatedConstruction;
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
void preservedOpenUnknown;
void preservedUnknown;
void preservedWrongKnownProperty;
void composedCallout;
void invalidComposedCallout;
void rootName;
void rootedImage;
void siblingHeading;
void slottedHeading;
void supportedDeepHeading;
void textKey;
void unknownRootedImage;
void value;
