'use client';

import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { plugins } from '@/lib/plate/plate-plugins';

export default function Editor() {
  const initialValue = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Hello, World!' }],
    },
  ];

  return (
    <PlateProvider plugins={plugins} initialValue={initialValue}>
      <Plate
        editableProps={{
          autoFocus: true,
          className: 'px-[96px] py-16 outline-none',
        }}
      />
    </PlateProvider>
  );
}
