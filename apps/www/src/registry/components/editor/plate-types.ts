'use client';

import type React from 'react';

import type { KEYS, TElement, TText } from '@udecode/plate';
import type { TCommentText } from '@udecode/plate-comments';
import type { TExcalidrawElement } from '@udecode/plate-excalidraw';
import type { TLinkElement } from '@udecode/plate-link';
import type { TImageElement, TMediaEmbedElement } from '@udecode/plate-media';
import type {
  TMentionElement,
  TMentionInputElement,
} from '@udecode/plate-mention';
import type { TTableElement } from '@udecode/plate-table';

/** Text */

export type EmptyText = {
  text: '';
};

export interface MyAlignProps {
  align?: React.CSSProperties['textAlign'];
}

export interface MyBlockElement
  extends MyLineHeightProps,
    MyListProps,
    TElement {
  id?: string;
}

/** Inline Elements */

export interface MyBlockquoteElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof KEYS.blockquote;
}

export interface MyCodeBlockElement extends MyBlockElement {
  children: MyCodeLineElement[];
  type: typeof KEYS.codeBlock;
}

export interface MyCodeLineElement extends TElement {
  children: PlainText[];
  type: typeof KEYS.codeLine;
}

export interface MyExcalidrawElement
  extends MyBlockElement,
    TExcalidrawElement {
  children: [EmptyText];
  type: typeof KEYS.excalidraw;
}

export interface MyH1Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h1';
}

export interface MyH2Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h2';
}

/** Block props */

export interface MyH3Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h3';
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof KEYS.hr;
}

export interface MyImageElement extends MyBlockElement, TImageElement {
  children: [EmptyText];
  type: typeof KEYS.img;
}

export interface MyListProps extends MyIndentProps {
  listRestart?: number;
  listStart?: number;
  listStyleType?: string;
}

export interface MyIndentProps {
  indent?: number;
}

/** Blocks */

export type MyInlineChildren = MyInlineDescendant[];

export type MyInlineDescendant = MyInlineElement | RichText;

export type MyInlineElement =
  | MyLinkElement
  | MyMentionElement
  | MyMentionInputElement;

export interface MyLineHeightProps {
  lineHeight?: React.CSSProperties['lineHeight'];
}

export interface MyLinkElement extends TLinkElement {
  children: RichText[];
  type: typeof KEYS.link;
}

export interface MyMediaEmbedElement
  extends MyBlockElement,
    TMediaEmbedElement {
  children: [EmptyText];
  type: typeof KEYS.mediaEmbed;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof KEYS.mention;
}

export interface MyMentionInputElement extends TMentionInputElement {
  children: [PlainText];
  type: typeof KEYS.mentionInput;
}

export type MyNestableBlock = MyParagraphElement;

export interface MyParagraphElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof KEYS.p;
}

export type MyRootBlock =
  | MyBlockquoteElement
  | MyCodeBlockElement
  | MyExcalidrawElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyHrElement
  | MyImageElement
  | MyMediaEmbedElement
  | MyParagraphElement
  | MyTableElement
  | MyToggleElement;

export interface MyTableCellElement extends TElement {
  children: MyNestableBlock[];
  type: typeof KEYS.td;
}

export interface MyTableElement extends MyBlockElement, TTableElement {
  children: MyTableRowElement[];
  type: typeof KEYS.table;
}

export interface MyTableRowElement extends TElement {
  children: MyTableCellElement[];
  type: typeof KEYS.tr;
}

export interface MyToggleElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof KEYS.toggle;
}

export type MyValue = MyRootBlock[];

export type PlainText = {
  text: string;
};

export interface RichText extends TCommentText, TText {
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
