'use client';

import { cn } from 'cn';
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

function TagLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string | undefined;
}) {
  if (href === undefined) return children;

  return <a href={href}>{children}</a>;
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
