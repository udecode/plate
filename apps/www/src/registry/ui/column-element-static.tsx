import * as React from 'react';

import type { TColumnElement } from '@udecode/plate-layout';

import { type SlateElementProps, SlateElement } from '@udecode/plate';

export function ColumnElementStatic(props: SlateElementProps<TColumnElement>) {
  const { width } = props.element;

  return (
    <div className="group/column relative" style={{ width: width ?? '100%' }}>
      <SlateElement
        className="h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0"
        {...props}
      >
        <div className="relative h-full border border-transparent p-1.5">
          {props.children}
        </div>
      </SlateElement>
    </div>
  );
}
