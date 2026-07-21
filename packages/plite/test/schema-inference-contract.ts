import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  element,
  property,
  schema,
  type SchemaElementFor,
  type SchemaElementPropertiesFor,
  type SchemaElementPropertyKeys,
  type SchemaElementTypes,
  type SchemaGroupNames,
  type SchemaPropertyIds,
  type SchemaRootNames,
  type SchemaText,
  type SchemaTextPropertyKeys,
  type SchemaValue,
  target,
} from '@platejs/plite';

const ArticleSchema = defineEditorSchema({
  elements: {
    heading: element({
      content: schema.content.text({ min: 1 }),
      groups: ['block'],
      properties: { level: property.number() },
    }),
    paragraph: element({
      content: schema.content.text({ min: 1 }),
      groups: ['block'],
      properties: { align: property.string() },
    }),
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
  root: schema.root({
    content: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  }),
  roots: {
    comments: schema.root({ content: schema.content.type('paragraph') }),
  },
  version: 1,
});

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
    paragraph: element({
      properties: { count: property.number() },
    }),
  },
  id: 'schema-inference-preserve-contract',
  root: schema.root({ content: schema.content.type('paragraph') }),
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
void explicitValue;
void groupName;
void headingProperties;
void inferredCustom;
void invalidElementProperty;
void invalidElementPropertyValue;
void invalidPropertyId;
void invalidTextPrefix;
void invalidTextPropertyValue;
void invalidType;
void paragraphKey;
void propertyIds;
void preservedKnown;
void preservedUnknown;
void preservedWrongKnownProperty;
void rootName;
void siblingHeading;
void slottedHeading;
void textKey;
void value;
