'use client';

import type { LinkProps } from 'next/link';
import Link from 'next/link';
import { property } from 'platejs';
import {
  type EditorElementProps,
  definePlugin,
  EditorElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/** The `tag` inline void: a chip with a label and an optional link. */
export const TagPlugin = definePlugin('tag', {
  schema: {
    element: {
      properties: {
        url: property.string(),
        value: property.string({ required: true }),
      },
      void: 'inline',
    },
  },
});

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;

function toLinkHref(href: string): LinkProps<string>['href'] {
  if (ABSOLUTE_HREF_REGEX.test(href)) return new URL(href);
  if (href.startsWith('#')) return { hash: href.slice(1) };
  if (href.startsWith('?')) return { search: href.slice(1) };

  return { pathname: href };
}

export function TagElement(props: EditorElementProps<typeof TagPlugin>) {
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

  return (
    <EditorElement
      {...props}
      className="m-0.5 inline-flex cursor-pointer select-none"
      attributes={{
        ...props.attributes,
        draggable: true,
      }}
    >
      <span contentEditable={false}>
        {readOnly && element.url ? (
          <Link href={toLinkHref(element.url)}>{badge}</Link>
        ) : (
          badge
        )}
      </span>
      {props.children}
    </EditorElement>
  );
}
