import React, { useState } from 'react';
import {
  getPlateSelectors,
  Plate,
  PlateEditor,
  TElement,
  TImageElement as ImageElement,
  TLinkElement as LinkElement,
  TTableElement as TableElement,
  TText,
  useEditorRef,
  useEditorState,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate';

/**
 * Text
 */

export interface MyText extends TText {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  underline?: boolean;
}

/**
 * Inline Elements
 */

export interface TLinkElement extends LinkElement {
  type: 'link';
  children: MyText[];
}

export type MyInlineElements = TLinkElement;

export type MyInlineNodes = MyInlineElements | MyText;

/**
 * Blocks
 */

export interface TParagraphElement extends TElement {
  type: 'paragraph';
  children: MyInlineNodes[];
}

export interface TBulletedListElement extends TElement {
  type: 'bulleted-list';
  children: TListItemElement[];
}

export interface TNumberedListElement extends TElement {
  type: 'numbered-list';
  children: TListItemElement[];
}

export interface TListItemElement extends TElement {
  type: 'list-item';
  children: MyInlineNodes[];
}

export interface THeadingElement extends TElement {
  type: 'heading';
  children: MyInlineNodes[];
}

export interface TImageElement extends ImageElement {
  type: 'image';
  children: [MyText];
}

export interface TQuoteElement extends TElement {
  type: 'quote';
  children: MyInlineNodes[];
}

export interface TTableElement extends TElement, TableElement {
  type: 'table';
  children: TTableRowElement[];
}

export interface TTableRowElement extends TElement {
  type: 'tr';
  children: TTableCellElement[];
}

export interface TTableCellElement extends TElement {
  type: 'td';
  children: MyNestableBlocks[];
}

export type MyNestableBlocks =
  | TParagraphElement
  | TImageElement
  | TBulletedListElement
  | TNumberedListElement
  | TQuoteElement;

export type MyRootBlocks = THeadingElement | TTableElement;

export type MyBlocks = MyRootBlocks | MyNestableBlocks;

export type MyValue = MyBlocks[];

export type MyEditor = PlateEditor<MyValue> & { typescript: boolean };

/**
 * Utils
 */

export const useTEditorRef = () => useEditorRef<MyValue, MyEditor>();
export const useTEditorState = () => useEditorState<MyValue, MyEditor>();
export const useTPlateEditorRef = (id?: string) =>
  usePlateEditorRef<MyValue, MyEditor>(id);
export const useTPlateEditorState = (id?: string) =>
  usePlateEditorState<MyValue, MyEditor>(id);

/**
 * Example
 */

export const TypeScriptExample = () => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const [value, setValue] = useState(initialValue);

  const editor = getPlateSelectors<MyValue>().editor();
  console.info(editor);

  return (
    // Because of the TypeScript-awareness you'll also get an error if you
    // initialize the editor with an invalid value or other invalid props.
    <Plate<MyValue, MyEditor> value={value} onChange={(v) => setValue(v)} />
  );
};

// Slate is TypeScript-aware, so if you try to use any unrecognizes `type`
// properties in this initial value you will get a compiler error.
const initialValue: MyValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'All the Slate examples are written in TypeScript. However, ',
      },
      { text: 'most', italic: true },
      { text: ' of them use ' },
      { text: 'implicit', bold: true },
      {
        text:
          " typings in many places because it makes it easier to see the actual Slate-specific code—especially for people who don't know TypeScript.",
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'This example is written with ' },
      { text: 'explicit', bold: true },
      {
        text:
          ' typings in all places, so you can see what a more realistic TypeScript usage would look like.',
      },
    ],
  },
  {
    type: 'heading',
    children: [{ text: 'Quotes' }],
  },
  {
    type: 'paragraph',
    children: [{ text: "We'll throw in a few things like quotes…" }],
  },
  {
    type: 'quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'heading',
    children: [{ text: 'Images' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'And images…' }],
  },
  {
    type: 'image',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
];
