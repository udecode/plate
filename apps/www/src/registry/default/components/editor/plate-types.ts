'use client';

import type React from 'react';

import type { TElement, TText } from '@udecode/plate';
import type { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import type {
  CodeBlockPlugin,
  CodeLinePlugin,
} from '@udecode/plate-code-block/react';
import type { TCommentText } from '@udecode/plate-comments';
import type { TExcalidrawElement } from '@udecode/plate-excalidraw';
import type { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import type { HEADING_KEYS } from '@udecode/plate-heading';
import type { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import type { TLinkElement } from '@udecode/plate-link';
import type { LinkPlugin } from '@udecode/plate-link/react';
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
import type { ParagraphPlugin } from '@udecode/plate/react';

/** Text */

export type EmptyText = {
  text: '';
};

export interface MyAlignProps {
  align?: React.CSSProperties['textAlign'];
}

export interface MyBlockElement
  extends MyIndentListProps,
    MyLineHeightProps,
    TElement {
  id?: string;
}

/** Inline Elements */

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

export interface MyExcalidrawElement
  extends MyBlockElement,
    TExcalidrawElement {
  children: [EmptyText];
  type: typeof ExcalidrawPlugin.key;
}

export interface MyH1Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h1;
}

export interface MyH2Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h2;
}

/** Block props */

export interface MyH3Element extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof HEADING_KEYS.h3;
}

export interface MyHrElement extends MyBlockElement {
  children: [EmptyText];
  type: typeof HorizontalRulePlugin.key;
}

export interface MyImageElement extends MyBlockElement, TImageElement {
  children: [EmptyText];
  type: typeof ImagePlugin.key;
}

export interface MyIndentListProps extends MyIndentProps {
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
  type: typeof LinkPlugin.key;
}

export interface MyMediaEmbedElement
  extends MyBlockElement,
    TMediaEmbedElement {
  children: [EmptyText];
  type: typeof MediaEmbedPlugin.key;
}

export interface MyMentionElement extends TMentionElement {
  children: [EmptyText];
  type: typeof MentionPlugin.key;
}

export interface MyMentionInputElement extends TMentionInputElement {
  children: [PlainText];
  type: typeof MentionInputPlugin.key;
}

export type MyNestableBlock = MyParagraphElement;

export interface MyParagraphElement extends MyBlockElement {
  children: MyInlineChildren;
  type: typeof ParagraphPlugin.key;
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
  type: typeof TableCellPlugin.key;
}

export interface MyTableElement extends MyBlockElement, TTableElement {
  children: MyTableRowElement[];
  type: typeof TablePlugin.key;
}

export interface MyTableRowElement extends TElement {
  children: MyTableCellElement[];
  type: typeof TableRowPlugin.key;
}

export interface MyToggleElement extends MyBlockElement, TToggleElement {
  children: MyInlineChildren;
  type: typeof TogglePlugin.key;
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

// export type MyElement = ElementOf<MyEditor>;

// export type MyBlock = Exclude<MyElement, MyInlineElement>;

// export type MyEditor = ReturnType<typeof useCreateEditor>;

// export const useEditor = () => useEditorRef<MyEditor>();
