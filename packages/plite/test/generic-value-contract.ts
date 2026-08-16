import {
  type AncestorEntry,
  type AncestorIn,
  type BooleanMarkKeysOf,
  type BooleanMarksOf,
  type ChildOf,
  ContentSlice,
  createEditor,
  type DescendantEntry,
  type DescendantEntryOf,
  type DescendantIn,
  type Editor,
  type EditorDocumentValue,
  type EditorSnapshot,
  type Element,
  ElementApi,
  type ElementEntry,
  type ElementEntryOf,
  type ElementOf,
  type ElementOrTextIn,
  type MarkKeysOf,
  type MarksIn,
  type MarksOf,
  type NodeChildEntry,
  type NodeEntryIn,
  type NodeEntryOf,
  type NodeIn,
  type Path,
  type Point,
  type Range,
  type Text,
  TextApi,
  type TextEntry,
  type TextEntryIn,
  type TextEntryOf,
  type TextOf,
  type Value,
  type ValueOf,
} from '@platejs/plite';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
type IsAny<T> = 0 extends 1 & T ? true : false;

type CustomText = {
  text: string;
  bold?: true;
  code?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type QuoteElement = {
  type: 'quote';
  children: CustomText[];
};

type PlainText = {
  text: string;
};

type PlainElement = {
  type: 'plain';
  children: PlainText[];
};

type RichText = {
  text: string;
  bold?: true;
  code?: true;
  fontSize?: string;
  italic?: boolean;
};

type RichElement = {
  type: 'rich';
  children: RichText[];
};

type RequiredMarkText = {
  text: string;
  bold: true;
  code: true;
};

type RequiredMarkElement = {
  type: 'required-mark';
  children: RequiredMarkText[];
};

type CustomValue = (ParagraphElement | QuoteElement)[];

const value: CustomValue = [{ type: 'paragraph', children: [{ text: 'one' }] }];

const editor = createEditor<CustomValue>();
const typedEditor: Editor<CustomValue> = editor;
const inferredReadonlyEditor = createEditor({
  initialValue: [
    { type: 'paragraph', children: [{ bold: true, text: 'inferred' }] },
  ],
});
declare const externalDocument: EditorDocumentValue<
  {
    children: { text: string; transient: false }[];
    type: 'external';
  }[]
>;
const fittedDocument = typedEditor.read.schema.fitDocument(externalDocument);

typedEditor.update((tx) => {
  tx.value.replace({
    children: value,
    selection: null,
  });
});

type _ValueExtendsBase = Assert<CustomValue extends Value ? true : false>;
type _BareEditorDoesNotEraseValue = Assert<
  Equal<IsAny<ValueOf<Editor>>, false>
>;
type _BareEditorDefaultsToValue = Assert<Equal<ValueOf<Editor>, Value>>;
type _EditorKeepsValue = Assert<
  Equal<ValueOf<typeof typedEditor>, CustomValue>
>;
type _FitDocumentReturnsCanonicalEditorValue = Assert<
  Equal<typeof fittedDocument, EditorDocumentValue<CustomValue>>
>;
type _EditorKeepsElements = Assert<
  Equal<ElementOf<typeof typedEditor>, ParagraphElement | QuoteElement>
>;
type _EditorKeepsText = Assert<Equal<TextOf<typeof typedEditor>, CustomText>>;
type _ValueKeepsElements = Assert<
  Equal<
    ElementOrTextIn<CustomValue>,
    ParagraphElement | QuoteElement | CustomText
  >
>;
type _ValueKeepsDescendants = Assert<
  Equal<DescendantIn<CustomValue>, ParagraphElement | QuoteElement | CustomText>
>;
type _ValueKeepsNodes = Assert<
  Equal<NodeIn<CustomValue>, ParagraphElement | QuoteElement | CustomText>
>;
type _ValueKeepsAncestors = Assert<
  Equal<
    AncestorIn<CustomValue>,
    Editor<CustomValue, any> | ParagraphElement | QuoteElement
  >
>;
type _ChildOfParagraph = Assert<Equal<ChildOf<ParagraphElement>, CustomText>>;
type _MarksFromNode = Assert<
  Equal<MarksOf<ParagraphElement>, { bold?: true; code?: true }>
>;
type _MarksFromValue = Assert<
  Equal<MarksIn<CustomValue>, { bold?: true; code?: true }>
>;
type _MarkKeys = Assert<
  Equal<MarkKeysOf<RequiredMarkElement>, 'bold' | 'code'>
>;
type _OptionalMarkKeysFollowPlateFallback = Assert<
  Equal<MarkKeysOf<ParagraphElement>, unknown>
>;
type _MarkKeysAreUnknownWhenNoMarksExist = Assert<
  Equal<MarkKeysOf<PlainElement>, unknown>
>;
type _BooleanMarkKeysFromText = Assert<
  Equal<BooleanMarkKeysOf<RichText>, 'bold' | 'code' | 'italic'>
>;
type _BooleanMarkKeysFromElement = Assert<
  Equal<BooleanMarkKeysOf<RichElement>, 'bold' | 'code' | 'italic'>
>;
type _BooleanMarksFromText = Assert<
  Equal<
    BooleanMarksOf<RichText>,
    { bold?: true; code?: true; italic?: boolean }
  >
>;
type _AncestorEntry = Assert<
  Equal<
    AncestorEntry<ParagraphElement>,
    readonly [ParagraphElement, import('@platejs/plite').Path]
  >
>;
type _DescendantEntry = Assert<
  Equal<
    DescendantEntry<ParagraphElement>,
    readonly [ParagraphElement | CustomText, import('@platejs/plite').Path]
  >
>;
type _DescendantEntryFromEditor = Assert<
  Equal<
    DescendantEntryOf<typeof typedEditor>,
    readonly [
      ParagraphElement | QuoteElement | CustomText,
      import('@platejs/plite').Path,
    ]
  >
>;
type _ElementEntry = Assert<
  Equal<
    ElementEntry<ParagraphElement>,
    readonly [ParagraphElement, import('@platejs/plite').Path]
  >
>;

const assertReadonlyPublication = (
  value: Value,
  element: Element,
  text: Text,
  path: Path,
  point: Point,
  range: Range,
  snapshot: EditorSnapshot
) => {
  // @ts-expect-error published values do not expose array mutation
  value[0] = element;
  // @ts-expect-error published element children are readonly
  element.children[0] = text;
  // @ts-expect-error published element properties are readonly
  element.type = 'changed';
  // @ts-expect-error published text properties are readonly
  text.text = 'changed';
  // @ts-expect-error published paths are readonly
  path[0] = 1;
  // @ts-expect-error published points are readonly
  point.offset = 1;
  // @ts-expect-error published ranges are readonly
  range.anchor = point;
  // @ts-expect-error published snapshots expose readonly children
  snapshot.children[0] = element;
};

void assertReadonlyPublication;

const assertInferredReadonlyPublication = (
  inferred: typeof inferredReadonlyEditor
) => {
  const children = inferred.read.children();

  // @ts-expect-error inferred published values do not expose array mutation
  children[0] = { type: 'paragraph', children: [{ text: 'changed' }] };
  // @ts-expect-error inferred published element children are readonly
  children[0].children[0] = { text: 'changed' };
  // @ts-expect-error inferred published text properties are readonly
  children[0].children[0].text = 'changed';
  // Inference still retains literal custom properties.
  const bold: boolean = children[0].children[0].bold;

  return bold;
};

void assertInferredReadonlyPublication;
type _NodeChildEntry = Assert<
  Equal<
    NodeChildEntry<ParagraphElement>,
    readonly [CustomText, import('@platejs/plite').Path]
  >
>;
type _TextEntry = Assert<
  Equal<
    TextEntry<ParagraphElement>,
    readonly [CustomText, import('@platejs/plite').Path]
  >
>;
type _TextEntryFromValue = Assert<
  Equal<
    TextEntryIn<CustomValue>,
    readonly [CustomText, import('@platejs/plite').Path]
  >
>;
type _NodeEntryFromValue = Assert<
  Equal<
    NodeEntryIn<CustomValue>,
    readonly [
      ParagraphElement | QuoteElement | CustomText,
      import('@platejs/plite').Path,
    ]
  >
>;
type _NodeEntryFromEditor = Assert<
  Equal<
    NodeEntryOf<typeof typedEditor>,
    readonly [
      Editor<CustomValue> | ParagraphElement | QuoteElement | CustomText,
      import('@platejs/plite').Path,
    ]
  >
>;
type _ElementEntryFromEditor = Assert<
  Equal<
    ElementEntryOf<typeof typedEditor>,
    readonly [ParagraphElement | QuoteElement, import('@platejs/plite').Path]
  >
>;
type _TextEntryFromEditor = Assert<
  Equal<
    TextEntryOf<typeof typedEditor>,
    readonly [CustomText, import('@platejs/plite').Path]
  >
>;
type _ContentSliceFromEditor = Assert<
  Equal<
    ReturnType<typeof typedEditor.read.slice.get>,
    import('@platejs/plite').ContentSlice<CustomValue>
  >
>;

const maybeText: unknown = { text: 'one', bold: true };
if (TextApi.isText<CustomText>(maybeText)) {
  const custom: CustomText = maybeText;
  void custom;
}

const maybeElement: unknown = {
  type: 'paragraph',
  children: [{ text: 'one' }],
};
if (ElementApi.isElement<ParagraphElement>(maybeElement)) {
  const custom: ParagraphElement = maybeElement;
  void custom;
}

const assertPrimitiveMethodTypes = () => {
  const slice: import('@platejs/plite').ContentSlice<CustomValue> =
    typedEditor.read.slice.get();
  const fitted: false | import('@platejs/plite').TransactionSpec =
    typedEditor.read.slice.fit(slice);
  const fittedContent: readonly DescendantIn<CustomValue>[] | null =
    typedEditor.read.slice.fitContent(slice, {
      parent: { children: [{ text: '' }], type: 'paragraph' },
    });

  typedEditor.update((tx) => {
    tx.nodes.insert({ type: 'quote', children: [{ text: 'two' }] });
    tx.fragment.replace([{ type: 'paragraph', children: [{ text: 'two' }] }]);
    tx.slice.replace(ContentSlice.empty);
    tx.slice.replace(slice);
    tx.nodes.wrap({ type: 'quote', children: [] });
    tx.nodes.set({ type: 'quote' });
  });
  typedEditor.update.fragment.replace([
    { type: 'paragraph', children: [{ text: 'three' }] },
  ]);

  void fitted;
  void fittedContent;
};

void assertPrimitiveMethodTypes;
void typedEditor;
