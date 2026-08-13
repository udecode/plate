import * as React from 'react';

import type { PliteElementProps } from 'platejs/static';

import { BaseLinkPlugin } from '@platejs/link';
import { PliteElement } from 'platejs/static';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function LinkElementStatic(
  props: PliteElementProps<typeof BaseLinkPlugin>
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
        ...props.editor.plugin(BaseLinkPlugin).api.getAttributes(props.element),
      }}
    >
      {props.children}
    </PliteElement>
  );
}
