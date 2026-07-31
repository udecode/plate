'use client';

import * as React from 'react';

import type { TLinkElement } from 'platejs';
import type { StyledPlateElementProps } from 'platejs/react';

import { type LinkDefinition, LinkPlugin } from '@platejs/link/react';
import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function LinkElement(
  props: StyledPlateElementProps<TLinkElement, LinkDefinition, 'a'>
) {
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
        onMouseOver: (e) => {
          e.stopPropagation();
        },
      }}
    >
      {props.children}
    </PlateElement>
  );
}
