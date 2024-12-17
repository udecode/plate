import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';

import { SlateElement } from '@udecode/plate-common';

export const CodeLineElementStatic = ({
  children,
  ...props
}: SlateElementProps) => {
  return <SlateElement {...props}>{children}</SlateElement>;
};
