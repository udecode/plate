'use client';

import React from 'react';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import { plugins } from '@/lib/plate/plate-plugins';
import { cn } from '@/lib/utils';

export default function Editor() {
  const initialValue = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Hello, World!' }],
    },
  ];

  return (
    <PlateProvider plugins={plugins} initialValue={initialValue}>
      <div className={cn('relative flex w-full overflow-x-auto')}>
        <Plate
          editableProps={{
            autoFocus: true,
            className: cn(
              'relative max-w-full leading-[1.4] outline-none [&_strong]:font-bold',
              '!min-h-[600px] px-[96px] py-16'
            ),
          }}
        />
      </div>
    </PlateProvider>
  );
}
