import * as React from 'react';

import type { SlateElementProps } from '@udecode/plate';

import { SlateElement } from '@udecode/plate';

export function ColumnGroupElementStatic(props: SlateElementProps) {
  return (
    <SlateElement className="mb-2" {...props}>
      <div className="flex size-full rounded">{props.children}</div>
    </SlateElement>
  );
}
