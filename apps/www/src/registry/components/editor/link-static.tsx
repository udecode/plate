import { BaseLinkPlugin } from '@platejs/link';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

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

export const BaseLinkKit = [
  BaseLinkPlugin.configure({ component: LinkElementStatic }),
];
