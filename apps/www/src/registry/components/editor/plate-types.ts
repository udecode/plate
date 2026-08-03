'use client';

import type { Element, Text } from '@platejs/plite';
import type {
  EmptyText,
  NODES,
  PlainText,
  TBasicMarks,
  TComboboxInputElement,
  TCommentText,
  TFontMarks,
  TImageElement,
  TLineHeightProps,
  TLinkElement,
  TListProps,
  TMediaEmbedElement,
  TMentionElement,
  TResizableProps,
  TTableElement,
  TTextAlignProps,
} from 'platejs';

export interface MyBlockElement extends Element, TListProps {
  id?: string;
}

export interface MyTextBlockElement
  extends Element,
    TLineHeightProps,
    TTextAlignProps {
  children: (
    | MyLinkElement
    | MyMentionElement
    | MyMentionInputElement
    | RichText
  )[];
}

export interface MyBlockquoteElement extends MyTextBlockElement {
  type: typeof NODES.blockquote;
}

export interface MyCodeBlockElement extends MyBlockElement {
  children: MyCodeLineElement[];
  type: typeof NODES.codeBlock;
}

export interface MyCodeLineElement extends Element {
  children: PlainText[];
  type: typeof NODES.codeLine;
}

export interface MyH1Element extends MyTextBlockElement {
  type: typeof NODES.h1;
}

export interface MyH2Element extends MyTextBlockElement {
  type: typeof NODES.h2;
}

/** Block props */

export interface MyH3Element extends MyTextBlockElement {
  type: typeof NODES.h3;
}

export interface MyH4Element extends MyTextBlockElement {
  type: typeof NODES.h4;
}

export interface MyH5Element extends MyTextBlockElement {
  type: typeof NODES.h5;
}

export interface MyH6Element extends MyTextBlockElement {
  type: typeof NODES.h6;
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof NODES.hr;
}

export interface MyImageElement extends TImageElement, TResizableProps {
  id?: string;
  type: typeof NODES.img;
}

export interface MyLinkElement extends TLinkElement {
  children: RichText[];
  type: typeof NODES.link;
}

export interface MyMediaEmbedElement
  extends TMediaEmbedElement,
    TResizableProps {
  id?: string;
  type: typeof NODES.mediaEmbed;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof NODES.mention;
}

export interface MyMentionInputElement extends TComboboxInputElement {
  children: [PlainText];
  type: typeof NODES.mentionInput;
}

export type MyNestableBlock = MyParagraphElement;

export interface MyParagraphElement extends MyTextBlockElement {
  type: typeof NODES.p;
}

export interface MyTableCellElement extends Element {
  children: MyNestableBlock[];
  type: typeof NODES.td;
}

export interface MyTableElement extends MyBlockElement, TTableElement {
  children: MyTableRowElement[];
  type: typeof NODES.table;
}

export interface MyTableRowElement extends Element {
  children: MyTableCellElement[];
  type: typeof NODES.tr;
}

export interface MyToggleElement extends MyTextBlockElement {
  type: typeof NODES.toggle;
}

export interface RichText extends TBasicMarks, TCommentText, TFontMarks, Text {
  kbd?: boolean;
}

export type MyValue = (
  | MyBlockquoteElement
  | MyCodeBlockElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyH5Element
  | MyH6Element
  | MyHrElement
  | MyImageElement
  | MyMediaEmbedElement
  | MyParagraphElement
  | MyTableElement
  | MyToggleElement
)[];
