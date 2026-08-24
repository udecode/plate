'use client';

import type { MultiSelectPlugin } from '@platejs/tag/react';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { PlateElementProps } from 'platejs/react';
import {
  PlateElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

function toLinkHref(href: string): LinkProps<string>['href'] {
  if (ABSOLUTE_HREF_REGEX.test(href)) return new URL(href);
  if (href.startsWith('#')) return { hash: href.slice(1) };
  if (href.startsWith('?')) return { search: href.slice(1) };

  return { pathname: href };
}

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
      {element.value}
    </div>
  );

  const content =
    readOnly && element.url ? (
      <Link href={toLinkHref(element.url)}>{badge}</Link>
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
