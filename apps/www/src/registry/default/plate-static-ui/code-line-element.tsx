import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { StaticElement } from './paragraph-element';

export const CodeLineStaticElement = ({
  children,
  ...props
}: StaticElementProps) => {
  return <StaticElement {...props}>{children}</StaticElement>;
};
