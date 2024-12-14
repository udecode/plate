import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { PlateStaticElement } from '@udecode/plate-common';

export const CodeLineElementStatic = ({
  children,
  ...props
}: StaticElementProps) => {
  return <PlateStaticElement {...props}>{children}</PlateStaticElement>;
};
