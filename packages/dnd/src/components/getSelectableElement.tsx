import React, { forwardRef, ReactNode, useMemo } from 'react';
import {
  TRenderElementProps,
  useEditorStatic,
} from '@udecode/slate-plugins-core';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Editor, Path } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { Selectable } from './Selectable';
import { SelectableStyleProps, SelectableStyles } from './Selectable.types';

export interface GetSelectabelElementOptions {
  component: any;
  styles?: IStyleFunctionOrObject<SelectableStyleProps, SelectableStyles>;
  level?: number;
  filter?: (editor: Editor, path: Path) => boolean;
  allowReadOnly?: boolean;
  dragIcon?: ReactNode;
}

export const getSelectableElement = ({
  component: Component,
  styles,
  level,
  filter,
  allowReadOnly = false,
  dragIcon,
}: GetSelectabelElementOptions) => {
  return forwardRef(
    ({ attributes, element, ...props }: TRenderElementProps, ref) => {
      const editor = useEditorStatic();
      const readOnly = useReadOnly();
      const path = useMemo(() => ReactEditor.findPath(editor, element), [
        editor,
        element,
      ]);
      const filteredOut = useMemo(
        () =>
          (Number.isInteger(level) && level !== path.length - 1) ||
          (filter && filter(editor, path)),
        [path, editor]
      );
      if (filteredOut || (!allowReadOnly && readOnly)) {
        return (
          <Component attributes={attributes} element={element} {...props} />
        );
      }
      return (
        <Selectable
          attributes={attributes}
          componentRef={ref}
          element={element}
          styles={styles}
          dragIcon={dragIcon}
        >
          <Component attributes={attributes} element={element} {...props} />
        </Selectable>
      );
    }
  );
};
