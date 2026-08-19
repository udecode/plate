'use client';

import * as React from 'react';

import type { MultiSelectPlugin } from '@platejs/tag/react';
import type { PlateElementProps } from 'platejs/react';

import Link from 'next/link';
import {
  PlateElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';

import { cn } from '@/lib/utils';

export function TagElement(props: PlateElementProps<typeof MultiSelectPlugin>) {
  const { element } = props;
  const selected = useElementSelected();
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();

  const badge = (
    <div
      className={cn(
        'shrink-0 break-normal rounded-full border px-2.5 align-middle font-semibold text-sm transition-colors focus:outline-none',
        'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/60',
        selected && focused && 'ring-2 ring-ring ring-offset-0',
        'flex items-center gap-1.5'
      )}
    >
      {element.value as string}
    </div>
  );

  const content =
    readOnly && element.url ? (
      <Link href={element.url as string}>{badge}</Link>
    ) : (
      badge
    );

  return (
    <PlateElement
      {...props}
      className="m-0.5 inline-flex cursor-pointer select-none"
      attributes={{
        ...props.attributes,
        draggable: true,
      }}
    >
      {content}
      {props.children}
    </PlateElement>
  );
}
