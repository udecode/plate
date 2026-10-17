import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from 'platejs/footnote';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function FootnoteReferenceElementStatic(
  props: EditorElementProps<typeof BaseFootnotePlugin>
) {
  const { element } = props;
  const anchor = props.editor
    .plugin(BaseFootnotePlugin)
    .read.anchor({ path: props.path });

  return (
    <EditorElement
      {...props}
      as="sup"
      className="mx-0.5 align-super text-xs font-medium text-primary"
    >
      {props.children}
      <a
        data-editor-footnote-ref={element.ref}
        href={anchor?.target ? `#${anchor.target}` : undefined}
        id={anchor?.id}
      >
        [{element.ref ?? ''}]
      </a>
    </EditorElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: EditorElementProps<typeof BaseFootnoteDefinitionPlugin>
) {
  const { element } = props;
  const anchor = props.editor
    .plugin(BaseFootnotePlugin)
    .read.anchor({ path: props.path });

  return (
    <EditorElement
      {...props}
      as="div"
      className="mt-2 flex items-start gap-2"
      attributes={{
        ...props.attributes,
        'data-editor-footnote-definition': element.ref,
        id: anchor?.id,
      }}
    >
      <div
        className="mt-0.5 min-w-4 text-sm text-muted-foreground tabular-nums"
        data-editor-footnote-chrome=""
      >
        {element.ref ?? ''}
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
      {anchor?.target && (
        <a
          aria-label={`Back to reference ${element.ref}`}
          data-editor-footnote-chrome=""
          href={`#${anchor.target}`}
        >
          ↩
        </a>
      )}
    </EditorElement>
  );
}

export const BaseFootnoteKit = [
  BaseFootnotePlugin.configure({
    component: FootnoteReferenceElementStatic,
  }),
  BaseFootnoteDefinitionPlugin.configure({
    component: FootnoteDefinitionElementStatic,
  }),
];
