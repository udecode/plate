import React, { useState } from 'react';
import { getPlateSelectors, Plate, PlateEditor } from '@udecode/plate';

type FormattedText = {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  underline?: boolean;
  text: string;
};

type BulletedList = {
  type: 'bulleted-list';
  children: ListItem[];
};

type HeadingThree = {
  type: 'heading-three';
  children: FormattedText[];
};

type Image = {
  type: 'image';
  url: string;
  children: [FormattedText];
};

type Link = {
  type: 'link';
  url: string;
  children: FormattedText[];
};

type ListItem = {
  type: 'list-item';
  children: (Link | FormattedText)[];
};

type NumberedList = {
  type: 'numbered-list';
  children: ListItem[];
};

type Paragraph = {
  type: 'paragraph';
  children: (Link | FormattedText)[];
};

type Quote = {
  type: 'quote';
  children: (Link | FormattedText)[];
};

type MyElements =
  | Paragraph
  | Quote
  | Image
  | HeadingThree
  | BulletedList
  | NumberedList;

type MyValue = MyElements[];

type MyEditor = PlateEditor<MyValue> & { typescript: boolean };

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
    type: 'heading-three',
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
    type: 'heading-three',
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
