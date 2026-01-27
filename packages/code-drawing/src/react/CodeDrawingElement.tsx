import * as React from 'react';

import type { TCodeDrawingElement } from '../lib';
import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

export interface CodeDrawingElementProps
  extends PlateElementProps<TCodeDrawingElement> {}

export function CodeDrawingElement(props: CodeDrawingElementProps) {
  return <PlateElement {...props} />;
}
