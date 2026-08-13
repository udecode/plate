'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { LinkPlugin } from '@platejs/link/react';
import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function LinkElement(props: PlateElementProps<typeof LinkPlugin>) {
  return (
    <PlateElement
      {...props}
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        inlineSuggestionVariants()
      )}
      attributes={{
        ...props.attributes,
        ...props.editor.plugin(LinkPlugin).api.getAttributes(props.element),
        onMouseOver: (event) => event.stopPropagation(),
      }}
    >
      {props.children}
    </PlateElement>
  );
}
