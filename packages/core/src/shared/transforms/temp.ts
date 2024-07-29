import type React from 'react';

import type { TElement, TText } from '@udecode/slate';

import type { PlateId } from '../../client';
import type { PlateEditor } from '../types';

/** Text */

export interface RichText extends TText {
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

export interface MyBlockElement
  extends TElement,
    MyIndentListProps,
    MyLineHeightProps {
  id?: PlateId;
}

/** Blocks */

export interface MyParagraphElement extends MyBlockElement {
  children: RichText[];
  type: 'p';
}

export type MyNestableBlock = MyParagraphElement;

export type MyRootBlock = MyParagraphElement;

export type MyValue = MyRootBlock[];

/** Editor types */

export type MyEditor = { isDragging?: boolean } & PlateEditor<MyValue>;
