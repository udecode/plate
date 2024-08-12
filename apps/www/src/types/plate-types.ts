import type React from 'react';

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

import {
  type EElement,
  type TElement,
  type TPlateEditor,
  type TText,
  createPlugin,
} from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-common/react';

/** Text */

const MyCustomPlugin = createPlugin({
  api: {
    myCustomMethod: () => {},
  },
  key: 'myCustom',
});

// const editor = withPlate<Value, typeof MyCustomPlugin>(createTEditor(), {
//   plugins: [MyCustomPlugin],
// });
// const b: TPlateEditor<Value, typeof MyCustomPlugin> = {};
// b.api.myCustomMethod();

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
  id?: string;
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

export type MyElement = EElement<MyValue>;

export type MyBlock = Exclude<MyElement, MyInlineElement>;

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

/** Editor types */

export type MyValue = MyRootBlock[];

export type MyEditor = { isDragging?: boolean } & TPlateEditor<MyValue>;

export const useMyEditorRef = () => useEditorRef<MyEditor>();
