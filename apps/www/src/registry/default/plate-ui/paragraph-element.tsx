'use client';

import React from 'react';

import type {
  StaticElementProps,
  StaticLeafProps,
} from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { withRef } from '@udecode/plate-common/react';

import { PlateElement } from './plate-element';

export const ParagraphElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        className={cn('m-0 px-0 py-1', className)}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);

export const ParagraphStaticElement = ({ children }: StaticElementProps) => {
  return <div className="m-0 px-0 py-1">{children}</div>;
};

export function PlateStaticLeaf({ as, children }: StaticLeafProps) {
  const Leaf = (as ?? 'span') as any;

  return <Leaf>{children}</Leaf>;
}
