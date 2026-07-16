import * as React from 'react';

import type { TLinkElement } from 'platejs';
import type { StyledPliteElementProps } from 'platejs/static';

import { type BaseLinkConfig, getLinkAttributes } from '@platejs/link';
import { PliteElement } from 'platejs/static';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function LinkElementStatic(
  props: StyledPliteElementProps<TLinkElement, BaseLinkConfig, 'a'>
) {
  return (
    <PliteElement
      {...props}
      as="a"
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        inlineSuggestionVariants()
      )}
      attributes={{
        ...props.attributes,
        ...getLinkAttributes(props.editor, props.element),
      }}
    >
      {props.children}
    </PliteElement>
  );
}
