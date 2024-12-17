'use client';

import React from 'react';

import type { TMentionElement } from '@udecode/plate-mention';

import { cn, withRef } from '@udecode/cn';
import { IS_APPLE, getHandler } from '@udecode/plate-common';
import { useElement } from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import { useMounted } from '@/registry/default/hooks/use-mounted';

import { PlateElement } from './plate-element';

export const MentionElement = withRef<
  typeof PlateElement,
  {
    prefix?: string;
    onClick?: (mentionNode: any) => void;
  }
>(({ children, className, prefix, onClick, ...props }, ref) => {
  const element = useElement<TMentionElement>();
  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();
  const readOnly = useReadOnly();

  return (
    <PlateElement
      ref={ref}
      className={cn(
        className,
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium',
        !readOnly && 'cursor-pointer',
        selected && focused && 'ring-2 ring-ring',
        element.children[0].bold === true && 'font-bold',
        element.children[0].italic === true && 'italic',
        element.children[0].underline === true && 'underline'
      )}
      onClick={getHandler(onClick, element)}
      data-slate-value={element.value}
      contentEditable={false}
      draggable
      {...props}
    >
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {children}
          {prefix}
          {element.value}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {prefix}
          {element.value}
          {children}
        </React.Fragment>
      )}
    </PlateElement>
  );
});
