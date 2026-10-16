'use client';

import type { LinkProps } from 'next/link';
import Link from 'next/link';
import { BaseLinkPlugin, getLinkHref, property } from 'platejs';
import {
  type EditorElementProps,
  definePlugin,
  EditorElement,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
  usePluginStore,
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

// Next's development check throws on a path segment in brackets, which it
// reads as a route pattern.
function escapePath(pathname: string) {
  return pathname.replaceAll('[', '%5B').replaceAll(']', '%5D');
}

// Next encodes `?` and `#` inside a pathname, so a relative href keeps its
// search and hash in their own fields.
function toRelativeHref(href: string): LinkProps<string>['href'] {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const searchIndex = beforeHash.indexOf('?');

  return {
    hash: hashIndex === -1 ? '' : href.slice(hashIndex),
    pathname: escapePath(
      searchIndex === -1 ? beforeHash : beforeHash.slice(0, searchIndex)
    ),
    search: searchIndex === -1 ? '' : beforeHash.slice(searchIndex),
  };
}

function TagLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string | undefined;
}) {
  if (href === undefined) return children;
  if (!URL.canParse(href)) {
    return <Link href={toRelativeHref(href)}>{children}</Link>;
  }

  const url = new URL(href);

  // Next's formatter drops `//` from a URL object with another scheme, such
  // as `vscode://settings`.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return <a href={href}>{children}</a>;
  }

  url.pathname = escapePath(url.pathname);

  return <Link href={url}>{children}</Link>;
}

function ConfiguredTagLink({
  children,
  url,
}: {
  children: React.ReactNode;
  url: string;
}) {
  const allowedSchemes = usePluginStore(BaseLinkPlugin, 'allowedSchemes');

  return (
    <TagLink href={getLinkHref(url, { allowedSchemes })}>{children}</TagLink>
  );
}

export function TagElement(props: EditorElementProps<typeof TagPlugin>) {
  const { editor, element } = props;
  const selected = useElementSelected({ mode: 'text' });
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
          editor.plugin(BaseLinkPlugin).installed ? (
            <ConfiguredTagLink url={element.url}>{badge}</ConfiguredTagLink>
          ) : (
            <TagLink href={getLinkHref(element.url)}>{badge}</TagLink>
          )
        ) : (
          badge
        )}
      </span>
      {props.children}
    </EditorElement>
  );
}
