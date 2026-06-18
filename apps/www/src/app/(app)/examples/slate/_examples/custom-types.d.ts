import type {
  BooleanMarkKeysOf,
  Descendant,
  Element,
  Range,
} from '@platejs/slate';
import type { ReactEditor } from '@platejs/slate-react';

export type BlockQuoteElement = {
  type: 'block-quote';
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  align?: string;
  children: Descendant[];
};

export type CheckListItemElement = {
  type: 'check-list-item';
  checked: boolean;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: 'editable-void';
  childRoots: {
    body: string;
  };
  children: EmptyText[];
};

export type SyncedBlockElement = {
  type: 'synced-block';
  childRoots: {
    body: string;
  };
  copyId: string;
  children: EmptyText[];
};

export type HeadingElement = {
  type: 'heading-one';
  align?: string;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: 'heading-two';
  align?: string;
  children: Descendant[];
};

export type HeadingThreeElement = {
  type: 'heading-three';
  align?: string;
  children: Descendant[];
};

export type HeadingFourElement = {
  type: 'heading-four';
  align?: string;
  children: Descendant[];
};

export type HeadingFiveElement = {
  type: 'heading-five';
  align?: string;
  children: Descendant[];
};

export type HeadingSixElement = {
  type: 'heading-six';
  align?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: 'image';
  url: string;
  children: EmptyText[];
};

export type LinkElement = { type: 'link'; url: string; children: Descendant[] };

export type ButtonElement = { type: 'button'; children: Descendant[] };

export type BadgeElement = { type: 'badge'; children: Descendant[] };

export type ListItemElement = { type: 'list-item'; children: Descendant[] };

export type NumberedListItemElement = {
  type: 'numbered-list';
  start?: number;
  children: Descendant[];
};

export type MentionElement = {
  type: 'mention';
  character: string;
  children: CustomText[];
};

export type ParagraphElement = {
  type: 'paragraph';
  align?: string;
  role?: 'title';
  children: Descendant[];
};

export type ThematicBreakElement = {
  type: 'thematic-break';
  children: EmptyText[];
};

export type TableElement = { type: 'table'; children: TableRowElement[] };

export type TableCellElement = { type: 'table-cell'; children: Descendant[] };

export type TableRowElement = {
  type: 'table-row';
  children: TableCellElement[];
};

export type TitleElement = { type: 'title'; children: Descendant[] };

export type VideoElement = {
  type: 'video';
  url: string;
  children: EmptyText[];
};

export type CodeBlockElement = {
  type: 'code-block';
  language: string;
  children: Descendant[];
};

export type CodeLineElement = {
  type: 'code-line';
  children: Descendant[];
};

export type CustomElementWithAlign =
  | ParagraphElement
  | HeadingElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | HeadingFiveElement
  | HeadingSixElement
  | BlockQuoteElement
  | BulletedListElement;

export type CustomElement =
  | BlockQuoteElement
  | BulletedListElement
  | CheckListItemElement
  | EditableVoidElement
  | SyncedBlockElement
  | HeadingElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | HeadingFiveElement
  | HeadingSixElement
  | ImageElement
  | LinkElement
  | ButtonElement
  | BadgeElement
  | ListItemElement
  | NumberedListItemElement
  | MentionElement
  | ParagraphElement
  | ThematicBreakElement
  | TableElement
  | TableRowElement
  | TableCellElement
  | TitleElement
  | VideoElement
  | CodeBlockElement
  | CodeLineElement;

export type CustomElementType = CustomElement['type'];

export type CustomValue = CustomElement[];

export type CustomText = {
  backgroundColor?: string;
  bold?: boolean;
  color?: string;
  italic?: boolean;
  code?: boolean;
  fontSize?: string;
  subscript?: boolean;
  superscript?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  // MARKDOWN PREVIEW SPECIFIC LEAF
  underlined?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  text: string;
};

export type CustomTextKey = BooleanMarkKeysOf<CustomText>;

export type EmptyText = {
  text: string;
};

export type CustomEditor = ReactEditor<CustomValue> & {
  nodeToDecorations?: Map<Element, Range[]>;
};
