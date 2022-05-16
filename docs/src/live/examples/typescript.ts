import { PluginOptions } from '@babel/core';
import {
  EDescendant,
  EElement,
  EElementEntry,
  EElementOrText,
  EMarks,
  ENode,
  ENodeEntry,
  EText,
  ETextEntry,
  getPlateSelectors,
  PlateEditor,
  TElement,
  TImageElement as ImageElement,
  TLinkElement as LinkElement,
  TReactEditor,
  TTableElement as TableElement,
  TText,
  useEditorRef,
  useEditorState,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate';
import { NoInfer } from '../../../../packages/core/src/common/types/utility/NoInfer';
import { PlateProps } from '../../../../packages/core/src/components/Plate';
import { getTEditor } from '../../../../packages/core/src/slate/editor/TEditor';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../../../packages/core/src/stores/plate/platesStore';
import { getPlateEditorRef } from '../../../../packages/core/src/stores/plate/selectors/usePlateEditorRef';
import { OverrideByKey } from '../../../../packages/core/src/types/OverrideByKey';
import {
  Decorate,
  DecorateEntry,
} from '../../../../packages/core/src/types/plugins/Decorate';
import { DOMHandler } from '../../../../packages/core/src/types/plugins/DOMHandlers';
import { InjectComponent } from '../../../../packages/core/src/types/plugins/InjectComponent';
import { InjectProps } from '../../../../packages/core/src/types/plugins/InjectProps';
import { KeyboardHandler } from '../../../../packages/core/src/types/plugins/KeyboardHandler';
import { OnChange } from '../../../../packages/core/src/types/plugins/OnChange';
import { PlatePlugin } from '../../../../packages/core/src/types/plugins/PlatePlugin';
import { PlatePluginInsertData } from '../../../../packages/core/src/types/plugins/PlatePluginInsertData';
import { PlatePluginProps } from '../../../../packages/core/src/types/plugins/PlatePluginProps';
import { SerializeHtml } from '../../../../packages/core/src/types/plugins/SerializeHtml';
import { WithOverride } from '../../../../packages/core/src/types/plugins/WithOverride';
import {
  createPlateEditor,
  CreatePlateEditorOptions,
} from '../../../../packages/core/src/utils/createPlateEditor';
import { createPluginFactory } from '../../../../packages/core/src/utils/createPluginFactory';
import { ELEMENT_BLOCKQUOTE } from '../../../../packages/nodes/block-quote/src/createBlockquotePlugin';
import { ELEMENT_H1 } from '../../../../packages/nodes/heading/src/constants';
import { ELEMENT_IMAGE } from '../../../../packages/nodes/image/src/createImagePlugin';
import { ELEMENT_LINK } from '../../../../packages/nodes/link/src/createLinkPlugin';
import {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../../../../packages/nodes/list/src/createListPlugin';
import { ELEMENT_PARAGRAPH } from '../../../../packages/nodes/paragraph/src/createParagraphPlugin';
import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
} from '../../../../packages/nodes/table/src/createTablePlugin';

/**
 * Text
 */

export type EmptyText = {
  text: '';
};

export interface RichText extends TText {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  underline?: boolean;
}

/**
 * Inline Elements
 */

export interface TLinkElement extends LinkElement {
  type: typeof ELEMENT_LINK;
  children: RichText[];
}

export type MyInlineElement = TLinkElement;
export type MyInlineDescendant = MyInlineElement | RichText;
export type MyInlineChildren = MyInlineDescendant[];

/**
 * Blocks
 */

export interface TParagraphElement extends TElement {
  type: typeof ELEMENT_PARAGRAPH;
  children: MyInlineChildren;
}

export interface TBulletedListElement extends TElement {
  type: typeof ELEMENT_UL;
  children: TListItemElement[];
}

export interface TNumberedListElement extends TElement {
  type: typeof ELEMENT_OL;
  children: TListItemElement[];
}

export interface TListItemElement extends TElement {
  type: typeof ELEMENT_LI;
  children: MyInlineChildren;
}

export interface THeadingElement extends TElement {
  type: typeof ELEMENT_H1;
  children: MyInlineChildren;
}

export interface TImageElement extends ImageElement {
  type: typeof ELEMENT_IMAGE;
  children: [EmptyText];
}

export interface TQuoteElement extends TElement {
  type: typeof ELEMENT_BLOCKQUOTE;
  children: MyInlineChildren;
}

export interface TTableElement extends TElement, TableElement {
  type: typeof ELEMENT_TABLE;
  children: TTableRowElement[];
}

export interface TTableRowElement extends TElement {
  type: typeof ELEMENT_TR;
  children: TTableCellElement[];
}

export interface TTableCellElement extends TElement {
  type: typeof ELEMENT_TD;
  children: MyNestableBlock[];
}

export type MyNestableBlock =
  | TParagraphElement
  | TImageElement
  | TBulletedListElement
  | TNumberedListElement
  | TQuoteElement;

export type MyBlock = THeadingElement | TTableElement | MyNestableBlock;

export type MyValue = MyBlock[];

/**
 * Editor types
 */

export type MyEditor = PlateEditor<MyValue> & { typescript: boolean };
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
export const useTEditorRef = () => useEditorRef<MyValue, MyEditor>();
export const useTEditorState = () => useEditorState<MyValue, MyEditor>();
export const useTPlateEditorRef = (id?: string) =>
  usePlateEditorRef<MyValue, MyEditor>(id);
export const getTPlateEditorRef = (id?: string) =>
  getPlateEditorRef<MyValue, MyEditor>(id);
export const useTPlateEditorState = (id?: string) =>
  usePlateEditorState<MyValue, MyEditor>(id);
export const useTPlateSelectors = (id?: string) =>
  usePlateSelectors<MyValue, MyEditor>(id);
export const getTPlateSelectors = (id?: string) =>
  getPlateSelectors<MyValue, MyEditor>(id);
export const getTPlateActions = (id?: string) =>
  getPlateActions<MyValue, MyEditor>(id);

/**
 * Utils
 */

export const createTPlateEditor = (
  options: CreatePlateEditorOptions<MyValue, MyEditor> = {}
) => createPlateEditor<MyValue, MyEditor>(options);
export const createTPluginFactory = <P = PluginOptions>(
  defaultPlugin: PlatePlugin<NoInfer<P>, MyValue, MyEditor>
) => createPluginFactory(defaultPlugin);
