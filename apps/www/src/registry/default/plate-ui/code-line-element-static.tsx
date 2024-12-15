import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';

import { PlateElementStatic } from '@udecode/plate-common';

export const CodeLineElementStatic = ({
  children,
  ...props
}: PlateElementStaticProps) => {
  return <PlateElementStatic {...props}>{children}</PlateElementStatic>;
};
