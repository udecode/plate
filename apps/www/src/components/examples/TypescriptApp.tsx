import React, { useState } from 'react';
import { Plate } from '@udecode/plate-common';

import { MyEditor, MyValue } from '@/plate/plate.types';

export default function TypescriptApp() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const [value, setValue] = useState(initialValue);

  return (
    // Because of the TypeScript-awareness you'll also get an error if you
    // initialize the editor with an invalid value or other invalid props.
    <Plate<MyValue, MyEditor> value={value} onChange={(v) => setValue(v)} />
  );
}

// Slate is TypeScript-aware, so if you try to use any unrecognizes `type`
// properties in this initial value you will get a compiler error.
const initialValue: MyValue = [
  {
    type: 'p',
    children: [
      {
        text: 'All the Slate examples are written in TypeScript. However, ',
      },
      { text: 'most', italic: true },
      { text: ' of them use ' },
      { text: 'implicit', bold: true },
      {
        text: " typings in many places because it makes it easier to see the actual Slate-specific code—especially for people who don't know TypeScript.",
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'This example is written with ' },
      { text: 'explicit', bold: true },
      {
        text: ' typings in all places, so you can see what a more realistic TypeScript usage would look like.',
      },
    ],
  },
  {
    type: 'h1',
    children: [{ text: 'Quotes' }],
  },
  {
    type: 'p',
    children: [{ text: "We'll throw in a few things like quotes…" }],
  },
  {
    type: 'blockquote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'h1',
    children: [{ text: 'Images' }],
  },
  {
    type: 'p',
    children: [{ text: 'And images…' }],
  },
  {
    type: 'img',
    url: 'https://source.unsplash.com/kFrdX5IeQzI',
    children: [{ text: '' }],
  },
];
