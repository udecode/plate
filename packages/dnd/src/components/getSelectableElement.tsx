import React, { forwardRef, useMemo } from 'react';
import {
  SPRenderElementProps,
  TEditor,
  useTSlateStatic,
} from '@udecode/slate-plugins-core';
import { Path } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { Selectable } from './Selectable';
import { SelectableProps } from './Selectable.types';

export interface GetSelectabelElementOptions
  extends Pick<SelectableProps, 'dragIcon' | 'styles'> {
  component: any;
  level?: number;
  filter?: (editor: TEditor, path: Path) => boolean;
  allowReadOnly?: boolean;
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
    ({ attributes, element, ...props }: SPRenderElementProps, ref) => {
      const editor = useTSlateStatic();
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
