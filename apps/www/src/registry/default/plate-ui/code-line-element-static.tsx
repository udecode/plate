import React from 'react';

import type { SlateElementProps } from '@udecode/plate';

import { SlateElement } from '@udecode/plate';

export const CodeLineElementStatic = ({
  children,
  ...props
}: SlateElementProps) => {
  return <SlateElement {...props}>{children}</SlateElement>;
};
