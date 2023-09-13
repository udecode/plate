import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
import {
  createPlateEditor,
  CreatePlateEditorOptions,
  createPluginFactory,
  createPlugins,
  createTEditor,
  Decorate,
  DecorateEntry,
  DOMHandler,
  EDescendant,
  EElement,
  EElementEntry,
  EElementOrText,
  EMarks,
  ENode,
  ENodeEntry,
  EText,
  ETextEntry,
  getTEditor,
  InjectComponent,
  InjectProps,
  KeyboardHandler,
  NoInfer,
  OnChange,
  OverrideByKey,
  PlateEditor,
  PlateId,
  PlatePlugin,
  PlatePluginComponent,
  PlatePluginInsertData,
  PlatePluginProps,
  PlateProps,
  PluginOptions,
  SerializeHtml,
  TElement,
  TNodeEntry,
  TReactEditor,
  TText,
  useEditorRef,
  useEditorState,
  usePlateActions,
  usePlateEditorRef,
  usePlateEditorState,
  usePlateSelectors,
  usePlateStates,
  WithOverride,
} from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

/**
 * Text
 */

export type PlainText = {
  text: string;
};

export interface RichText extends TText {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  subscript?: boolean;
}

/**
 * Inline Elements
 */

export type MyInlineDescendant = RichText;
export type MyInlineChildren = MyInlineDescendant[];

/**
 * Block props
 */

export interface MyBlockElement extends TElement {}

/**
 * Blocks
 */

export interface MyParagraphElement extends MyBlockElement {
  type: typeof ELEMENT_PARAGRAPH;
  children: MyInlineChildren;
}

export interface MyH1Element extends MyBlockElement {
  type: typeof ELEMENT_H1;
  children: MyInlineChildren;
}

export interface MyH2Element extends MyBlockElement {
  type: typeof ELEMENT_H2;
  children: MyInlineChildren;
}

export interface MyH3Element extends MyBlockElement {
  type: typeof ELEMENT_H3;
  children: MyInlineChildren;
}

export interface MyH4Element extends MyBlockElement {
  type: typeof ELEMENT_H4;
  children: MyInlineChildren;
}

export interface MyH5Element extends MyBlockElement {
  type: typeof ELEMENT_H5;
  children: MyInlineChildren;
}

export interface MyH6Element extends MyBlockElement {
  type: typeof ELEMENT_H6;
  children: MyInlineChildren;
}

export interface MyBlockquoteElement extends MyBlockElement {
  type: typeof ELEMENT_BLOCKQUOTE;
  children: MyInlineChildren;
}

export interface MyCodeBlockElement extends MyBlockElement {
  type: typeof ELEMENT_CODE_BLOCK;
  children: MyCodeLineElement[];
}

export interface MyCodeLineElement extends TElement {
  type: typeof ELEMENT_CODE_LINE;
  children: PlainText[];
}

export type MyNestableBlock = MyParagraphElement;

export type MyBlock = MyElement;
export type MyBlockEntry = TNodeEntry<MyBlock>;

export type MyRootBlock =
  | MyParagraphElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyH5Element
  | MyH6Element
  | MyBlockquoteElement
  | MyCodeBlockElement;

export type MyValue = MyRootBlock[];

/**
 * Editor types
 */

export type MyEditor = PlateEditor<MyValue>;
export type MyReactEditor = TReactEditor<MyValue>;
export type MyNode = ENode<MyValue>;
export type MyNodeEntry = ENodeEntry<MyValue>;
export type MyElement = EElement<MyValue>;
export type MyElementEntry = EElementEntry<MyValue>;
export type MyText = EText<MyValue>;
export type MyTextEntry = ETextEntry<MyValue>;
export type MyElementOrText = EElementOrText<MyValue>;
export type MyDescendant = EDescendant<MyValue>;
export type MyMarks = EMarks<MyValue>;
export type MyMark = keyof MyMarks;

/**
 * Plate types
 */

export type MyDecorate<P = PluginOptions> = Decorate<P, MyValue, MyEditor>;
export type MyDecorateEntry = DecorateEntry<MyValue>;
export type MyDOMHandler<P = PluginOptions> = DOMHandler<P, MyValue, MyEditor>;
export type MyInjectComponent = InjectComponent<MyValue>;
export type MyInjectProps = InjectProps<MyValue>;
export type MyKeyboardHandler<P = PluginOptions> = KeyboardHandler<
  P,
  MyValue,
  MyEditor
>;
export type MyOnChange<P = PluginOptions> = OnChange<P, MyValue, MyEditor>;
export type MyOverrideByKey = OverrideByKey<MyValue, MyEditor>;
export type MyPlatePlugin<P = PluginOptions> = PlatePlugin<
  P,
  MyValue,
  MyEditor
>;
export type MyPlatePluginInsertData = PlatePluginInsertData<MyValue>;
export type MyPlatePluginProps = PlatePluginProps<MyValue>;
export type MyPlateProps = PlateProps<MyValue, MyEditor>;
export type MySerializeHtml = SerializeHtml<MyValue>;
export type MyWithOverride<P = PluginOptions> = WithOverride<
  P,
  MyValue,
  MyEditor
>;

/**
 * Plate store, Slate context
 */

export const getMyEditor = (editor: MyEditor) =>
  getTEditor<MyValue, MyEditor>(editor);
export const useMyEditorRef = () => useEditorRef<MyValue, MyEditor>();
export const useMyEditorState = () => useEditorState<MyValue, MyEditor>();
export const useMyPlateEditorRef = (id?: PlateId) =>
  usePlateEditorRef<MyValue, MyEditor>(id);
export const useMyPlateEditorState = (id?: PlateId) =>
  usePlateEditorState<MyValue, MyEditor>(id);
export const useMyPlateSelectors = (id?: PlateId) =>
  usePlateSelectors<MyValue, MyEditor>(id);
export const useMyPlateActions = (id?: PlateId) =>
  usePlateActions<MyValue, MyEditor>(id);
export const useMyPlateStates = (id?: PlateId) =>
  usePlateStates<MyValue, MyEditor>(id);

/**
 * Utils
 */
export const createMyEditor = () => createTEditor() as MyEditor;
export const createMyPlateEditor = (
  options: CreatePlateEditorOptions<MyValue, MyEditor> = {}
) => createPlateEditor<MyValue, MyEditor>(options);
export const createMyPluginFactory = <P = PluginOptions>(
  defaultPlugin: PlatePlugin<NoInfer<P>, MyValue, MyEditor>
) => createPluginFactory(defaultPlugin);
export const createMyPlugins = (
  plugins: MyPlatePlugin[],
  options?: {
    components?: Record<string, PlatePluginComponent>;
    overrideByKey?: MyOverrideByKey;
  }
) => createPlugins<MyValue, MyEditor>(plugins, options);
