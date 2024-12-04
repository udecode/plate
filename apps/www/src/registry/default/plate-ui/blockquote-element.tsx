'use client';

import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { cn, withRef } from '@udecode/cn';

import { PlateElement } from './plate-element';

export const BlockquoteElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        as="blockquote"
        className={cn('my-1 border-l-2 pl-6 italic', className)}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);

export const BlockquoteStaticElement = (props: StaticElementProps) => {
  return (
    <blockquote className="my-1 border-l-2 pl-6 italic">
      {props.children}
    </blockquote>
  );
};
