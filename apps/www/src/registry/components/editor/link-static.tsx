import { BaseLinkPlugin } from 'platejs';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function LinkElementStatic(
  props: EditorElementProps<typeof BaseLinkPlugin>
) {
  return (
    <EditorElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
      attributes={{
        ...props.attributes,
        ...props.editor.plugin(BaseLinkPlugin).api.getAttributes(props.element),
      }}
    >
      {props.children}
    </EditorElement>
  );
}

export const BaseLinkKit = [
  BaseLinkPlugin.configure({ component: LinkElementStatic }),
];
