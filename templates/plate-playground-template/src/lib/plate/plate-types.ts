import type React from 'react';

import type { useCreateEditor } from '@/components/plate-editor';
import type { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import type {
  CodeBlockPlugin,
  CodeLinePlugin,
} from '@udecode/plate-code-block/react';
import type { TCommentText } from '@udecode/plate-comments';
import type { ElementOf, TElement, TText } from '@udecode/plate-common';
import type { ParagraphPlugin } from '@udecode/plate-common/react';
import type { TExcalidrawElement } from '@udecode/plate-excalidraw';
import type { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import type { HEADING_KEYS } from '@udecode/plate-heading';
import type { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import type { TLinkElement } from '@udecode/plate-link';
import type { LinkPlugin } from '@udecode/plate-link/react';
import type { TTodoListItemElement } from '@udecode/plate-list';
import type {
  BulletedListPlugin,
  ListItemPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';
import type { TImageElement, TMediaEmbedElement } from '@udecode/plate-media';
import type { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import type {
  TMentionElement,
  TMentionInputElement,
} from '@udecode/plate-mention';
import type {
  MentionInputPlugin,
  MentionPlugin,
} from '@udecode/plate-mention/react';
import type { TTableElement } from '@udecode/plate-table';
import type {
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '@udecode/plate-table/react';
import type { TToggleElement } from '@udecode/plate-toggle';
import type { TogglePlugin } from '@udecode/plate-toggle/react';

import { useEditorRef } from '@udecode/plate-common/react';

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
  type: typeof LinkPlugin.key;
}

export interface MyMentionInputElement extends TMentionInputElement {
  children: [PlainText];
  type: typeof MentionInputPlugin.key;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof MentionPlugin.key;
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
  type: typeof ParagraphPlugin.key;
}

export interface MyH1Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h1;
}

export interface MyH2Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h2;
}

export interface MyH3Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h3;
}

export interface MyH4Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h4;
}

export interface MyH5Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h5;
}

export interface MyH6Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h6;
}

export interface MyBlockquoteElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof BlockquotePlugin.key;
}

export interface MyCodeBlockElement extends MyBlockElement {
  children: MyCodeLineElement[];
  type: typeof CodeBlockPlugin.key;
}

export interface MyCodeLineElement extends TElement {
  children: PlainText[];
  type: typeof CodeLinePlugin.key;
}

export interface MyTableElement extends TTableElement, MyBlockElement {
  children: MyTableRowElement[];
  type: typeof TablePlugin.key;
}

export interface MyTableRowElement extends TElement {
  children: MyTableCellElement[];
  type: typeof TableRowPlugin.key;
}

export interface MyTableCellElement extends TElement {
  children: MyNestableBlock[];
  type: typeof TableCellPlugin.key;
}

export interface MyBulletedListElement extends TElement, MyBlockElement {
  children: MyListItemElement[];
  type: typeof BulletedListPlugin.key;
}

export interface MyNumberedListElement extends TElement, MyBlockElement {
  children: MyListItemElement[];
  type: typeof NumberedListPlugin.key;
}

export interface MyListItemElement extends TElement, MyBlockElement {
  children: MyInlineChildren;
  type: typeof ListItemPlugin.key;
}

export interface MyTodoListElement
  extends TTodoListItemElement,
    MyBlockElement {
  children: MyInlineChildren;
  type: typeof TodoListPlugin.key;
}

export interface MyToggleElement extends TToggleElement, MyBlockElement {
  children: MyInlineChildren;
  type: typeof TogglePlugin.key;
}

export interface MyImageElement extends TImageElement, MyBlockElement {
  children: [EmptyText];
  type: typeof ImagePlugin.key;
}

export interface MyMediaEmbedElement
  extends TMediaEmbedElement,
    MyBlockElement {
  children: [EmptyText];
  type: typeof MediaEmbedPlugin.key;
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof HorizontalRulePlugin.key;
}

export interface MyExcalidrawElement
  extends TExcalidrawElement,
    MyBlockElement {
  children: [EmptyText];
  type: typeof ExcalidrawPlugin.key;
}

export type MyNestableBlock = MyParagraphElement;

export type MyElement = ElementOf<MyEditor>;

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

export type MyEditor = ReturnType<typeof useCreateEditor>;

export const useMyEditorRef = () => useEditorRef<MyEditor>();
