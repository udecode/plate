import type React from 'react';

import type { AutoformatRule } from '@udecode/plate-autoformat';
import type { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import type {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@udecode/plate-code-block';
import type { TCommentText } from '@udecode/plate-comments';
import type {
  ELEMENT_EXCALIDRAW,
  TExcalidrawElement,
} from '@udecode/plate-excalidraw';
import type {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import type { ELEMENT_HR } from '@udecode/plate-horizontal-rule';
import type { ELEMENT_LINK, TLinkElement } from '@udecode/plate-link';
import type {
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  TTodoListItemElement,
} from '@udecode/plate-list';
import type {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  TImageElement,
  TMediaEmbedElement,
} from '@udecode/plate-media';
import type {
  ELEMENT_MENTION,
  ELEMENT_MENTION_INPUT,
  TMentionElement,
  TMentionInputElement,
} from '@udecode/plate-mention';
import type { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import type {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TR,
  TTableElement,
} from '@udecode/plate-table';
import type { ELEMENT_TOGGLE, TToggleElement } from '@udecode/plate-toggle';
import type { TText } from '@udecode/slate';

import {
  type CreatePlateEditorOptions,
  type DOMHandler,
  type Decorate,
  type DecorateEntry,
  type EDescendant,
  type EElement,
  type EElementEntry,
  type EElementOrText,
  type EMarks,
  type ENode,
  type ENodeEntry,
  type EText,
  type ETextEntry,
  type InjectComponent,
  type InjectProps,
  type KeyboardHandler,
  type NoInfer,
  type OnChange,
  type OverrideByKey,
  type PlateEditor,
  type PlateId,
  type PlatePlugin,
  type PlatePluginComponent,
  type PlatePluginInsertData,
  type PlatePluginProps,
  type PlateProps,
  type PluginOptions,
  type SerializeHtml,
  type TElement,
  type TNodeEntry,
  type TReactEditor,
  type WithOverride,
  createPlateEditor,
  createPluginFactory,
  createPlugins,
  createTEditor,
  getTEditor,
  useEditorRef,
  useEditorState,
} from '@udecode/plate-common';

/** Text */

export type EmptyText = {
  text: '';
};

export type PlainText = {
  text: string;
};

export interface RichText extends TText, TCommentText {
  backgroundColor?: React.CSSProperties['backgroundColor'];
  bold?: boolean;
  code?: boolean;
  color?: React.CSSProperties['color'];
  fontFamily?: React.CSSProperties['fontFamily'];
  fontSize?: React.CSSProperties['fontSize'];
  fontWeight?: React.CSSProperties['fontWeight'];
  italic?: boolean;
  kbd?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  underline?: boolean;
}

/** Inline Elements */

export interface MyLinkElement extends TLinkElement {
  children: RichText[];
  type: typeof ELEMENT_LINK;
}

export interface MyMentionInputElement extends TMentionInputElement {
  children: [PlainText];
  type: typeof ELEMENT_MENTION_INPUT;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof ELEMENT_MENTION;
}

export type MyInlineElement =
  | MyLinkElement
  | MyMentionElement
  | MyMentionInputElement;

export type MyInlineDescendant = MyInlineElement | RichText;

export type MyInlineChildren = MyInlineDescendant[];

/** Block props */

export interface MyIndentProps {
  indent?: number;
}

export interface MyIndentListProps extends MyIndentProps {
  listRestart?: number;
  listStart?: number;
  listStyleType?: string;
}

export interface MyLineHeightProps {
  lineHeight?: React.CSSProperties['lineHeight'];
}

export interface MyAlignProps {
  align?: React.CSSProperties['textAlign'];
}

export interface MyBlockElement
  extends TElement,
    MyIndentListProps,
    MyLineHeightProps {
  id?: PlateId;
}

/** Blocks */

export interface MyParagraphElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_PARAGRAPH;
}

export interface MyH1Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H1;
}

export interface MyH2Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H2;
}

export interface MyH3Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H3;
}

export interface MyH4Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H4;
}

export interface MyH5Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H5;
}

export interface MyH6Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_H6;
}

export interface MyBlockquoteElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_BLOCKQUOTE;
}

export interface MyCodeBlockElement extends MyBlockElement {
  children: MyCodeLineElement[];
  type: typeof ELEMENT_CODE_BLOCK;
}

export interface MyCodeLineElement extends TElement {
  children: PlainText[];
  type: typeof ELEMENT_CODE_LINE;
}

export interface MyTableElement extends TTableElement, MyBlockElement {
  children: MyTableRowElement[];
  type: typeof ELEMENT_TABLE;
}

export interface MyTableRowElement extends TElement {
  children: MyTableCellElement[];
  type: typeof ELEMENT_TR;
}

export interface MyTableCellElement extends TElement {
  children: MyNestableBlock[];
  type: typeof ELEMENT_TD;
}

export interface MyBulletedListElement extends TElement, MyBlockElement {
  children: MyListItemElement[];
  type: typeof ELEMENT_UL;
}

export interface MyNumberedListElement extends TElement, MyBlockElement {
  children: MyListItemElement[];
  type: typeof ELEMENT_OL;
}

export interface MyListItemElement extends TElement, MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_LI;
}

export interface MyTodoListElement
  extends TTodoListItemElement,
    MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_TODO_LI;
}

export interface MyToggleElement extends TToggleElement, MyBlockElement {
  children: MyInlineChildren;
  type: typeof ELEMENT_TOGGLE;
}

export interface MyImageElement extends TImageElement, MyBlockElement {
  children: [EmptyText];
  type: typeof ELEMENT_IMAGE;
}

export interface MyMediaEmbedElement
  extends TMediaEmbedElement,
    MyBlockElement {
  children: [EmptyText];
  type: typeof ELEMENT_MEDIA_EMBED;
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof ELEMENT_HR;
}

export interface MyExcalidrawElement
  extends TExcalidrawElement,
    MyBlockElement {
  children: [EmptyText];
  type: typeof ELEMENT_EXCALIDRAW;
}

export type MyNestableBlock = MyParagraphElement;

export type MyBlock = Exclude<MyElement, MyInlineElement>;

export type MyBlockEntry = TNodeEntry<MyBlock>;

export type MyRootBlock =
  | MyBlockquoteElement
  | MyBulletedListElement
  | MyCodeBlockElement
  | MyExcalidrawElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyH5Element
  | MyH6Element
  | MyHrElement
  | MyImageElement
  | MyMediaEmbedElement
  | MyNumberedListElement
  | MyParagraphElement
  | MyTableElement
  | MyTodoListElement
  | MyToggleElement;

export type MyValue = MyRootBlock[];

/** Editor types */

export type MyEditor = { isDragging?: boolean } & PlateEditor<MyValue>;

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

/** Plate types */

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

/** Plate store, Slate context */

export const getMyEditor = (editor: MyEditor) =>
  getTEditor<MyValue, MyEditor>(editor);

export const useMyEditorRef = () => useEditorRef<MyValue, MyEditor>();

export const useMyEditorState = () => useEditorState<MyValue, MyEditor>();

/** Utils */
export const createMyEditor = () => createTEditor() as MyEditor;

export const createMyPlateEditor = (
  options: CreatePlateEditorOptions<MyValue, MyEditor> = {}
) => createPlateEditor<MyValue, MyEditor>(options);

export const createMyPluginFactory = <P = PluginOptions>(
  defaultPlugin: PlatePlugin<NoInfer<P>, MyValue, MyEditor>
) => createPluginFactory(defaultPlugin);

export const createMyPlugins = (
  plugins: PlatePlugin[],
  options?: {
    components?: Record<string, PlatePluginComponent>;
    overrideByKey?: OverrideByKey;
  }
) => createPlugins<MyValue, MyEditor>(plugins, options);

export type MyAutoformatRule = AutoformatRule<MyValue, MyEditor>;
