import { BaseColumnGroupPlugin, BaseColumnItemPlugin } from 'platejs/column';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function ColumnElementStatic(
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) {
  return (
    <div
      className="group/column relative w-full flex-none sm:w-auto sm:min-w-0 sm:flex-(--column-weight)"
      style={
        { '--column-weight': props.element.width ?? 1 } as React.CSSProperties
      }
    >
      <EditorElement className="h-full pt-2" {...props}>
        <div className="relative h-full border border-transparent p-1.5">
          {props.children}
        </div>
      </EditorElement>
    </div>
  );
}

export function ColumnGroupElementStatic(
  props: EditorElementProps<typeof BaseColumnGroupPlugin>
) {
  return (
    <EditorElement className="mb-2" {...props}>
      <div className="flex size-full flex-col gap-4 rounded sm:flex-row">
        {props.children}
      </div>
    </EditorElement>
  );
}

export const BaseColumnKit = [
  BaseColumnGroupPlugin.configure({
    component: ColumnGroupElementStatic,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementStatic,
  }),
];
