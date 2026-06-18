import {
  type AncestorEntry,
  type AncestorIn,
  type BooleanMarkKeysOf,
  type BooleanMarksOf,
  type ChildOf,
  createEditor,
  type DescendantEntry,
  type DescendantEntryOf,
  type DescendantIn,
  type Editor,
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
  TextApi,
  type TextEntry,
  type TextEntryIn,
  type TextEntryOf,
  type TextOf,
  type Value,
  type ValueOf,
} from '@platejs/slate';

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

typedEditor.update((tx) => {
  tx.value.replace({
    children: value,
    selection: null,
    marks: null,
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
    Editor<CustomValue> | ParagraphElement | QuoteElement
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
    [ParagraphElement, import('@platejs/slate').Path]
  >
>;
type _DescendantEntry = Assert<
  Equal<
    DescendantEntry<ParagraphElement>,
    [ParagraphElement | CustomText, import('@platejs/slate').Path]
  >
>;
type _DescendantEntryFromEditor = Assert<
  Equal<
    DescendantEntryOf<typeof typedEditor>,
    [
      ParagraphElement | QuoteElement | CustomText,
      import('@platejs/slate').Path,
    ]
  >
>;
type _ElementEntry = Assert<
  Equal<
    ElementEntry<ParagraphElement>,
    [ParagraphElement, import('@platejs/slate').Path]
  >
>;
type _NodeChildEntry = Assert<
  Equal<
    NodeChildEntry<ParagraphElement>,
    [CustomText, import('@platejs/slate').Path]
  >
>;
type _TextEntry = Assert<
  Equal<
    TextEntry<ParagraphElement>,
    [CustomText, import('@platejs/slate').Path]
  >
>;
type _TextEntryFromValue = Assert<
  Equal<TextEntryIn<CustomValue>, [CustomText, import('@platejs/slate').Path]>
>;
type _NodeEntryFromValue = Assert<
  Equal<
    NodeEntryIn<CustomValue>,
    [
      ParagraphElement | QuoteElement | CustomText,
      import('@platejs/slate').Path,
    ]
  >
>;
type _NodeEntryFromEditor = Assert<
  Equal<
    NodeEntryOf<typeof typedEditor>,
    [
      Editor<CustomValue> | ParagraphElement | QuoteElement | CustomText,
      import('@platejs/slate').Path,
    ]
  >
>;
type _ElementEntryFromEditor = Assert<
  Equal<
    ElementEntryOf<typeof typedEditor>,
    [ParagraphElement | QuoteElement, import('@platejs/slate').Path]
  >
>;
type _TextEntryFromEditor = Assert<
  Equal<
    TextEntryOf<typeof typedEditor>,
    [CustomText, import('@platejs/slate').Path]
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
  typedEditor.update((tx) => {
    tx.nodes.insert({ type: 'quote', children: [{ text: 'two' }] });
    tx.fragment.insert([{ type: 'paragraph', children: [{ text: 'two' }] }]);
    tx.nodes.wrap({ type: 'quote', children: [] });
    tx.nodes.set({ type: 'quote' });
  });
};

void assertPrimitiveMethodTypes;
void typedEditor;
