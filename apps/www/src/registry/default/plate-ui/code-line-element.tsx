'use client';

import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { withRef } from '@udecode/cn';

import { PlateElement } from './plate-element';

export const CodeLineElement = withRef<typeof PlateElement>((props, ref) => (
  <PlateElement ref={ref} {...props} />
));

export const CodeLineStaticElement = (props: StaticElementProps) => {
  const { children } = props;

  return <div>{children}</div>;
};
