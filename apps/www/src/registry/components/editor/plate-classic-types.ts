'use client';

import type React from 'react';

import type { KEYS, TElement, TText } from '@udecode/plate';
import type { TCommentText } from '@udecode/plate-comments';
import type { TExcalidrawElement } from '@udecode/plate-excalidraw';
import type { TLinkElement } from '@udecode/plate-link';
import type { TTodoListItemElement } from '@udecode/plate-list-classic';
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
  extends MyIndentProps,
    MyLineHeightProps,
    TElement {
  id?: string;
}

/** Inline Elements */

export interface MyBlockquoteElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof KEYS.blockquote;
}

export interface MyBulletedListElement extends MyBlockElement, TElement {
  children: MyListItemElement[];
  type: typeof KEYS.ulClassic;
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

/** Block props */

export interface MyH2Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h2';
}

export interface MyH3Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h3';
}

export interface MyH4Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h4';
}

export interface MyH5Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h5';
}

/** Blocks */

export interface MyH6Element extends MyBlockElement {
  children: MyInlineChildren;
  type: 'h6';
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof KEYS.hr;
}

export interface MyImageElement extends MyBlockElement, TImageElement {
  children: [EmptyText];
  type: typeof KEYS.img;
}

export interface MyIndentProps {
  indent?: number;
}

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

export interface MyListItemElement extends MyBlockElement, TElement {
  children: MyInlineChildren;
  type: typeof KEYS.liClassic;
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

export interface MyNumberedListElement extends MyBlockElement, TElement {
  children: MyListItemElement[];
  type: typeof KEYS.olClassic;
}

export interface MyParagraphElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof KEYS.p;
}

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

export interface MyTodoListElement
  extends MyBlockElement,
    TTodoListItemElement {
  children: MyInlineChildren;
  type: typeof KEYS.listTodoClassic;
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
