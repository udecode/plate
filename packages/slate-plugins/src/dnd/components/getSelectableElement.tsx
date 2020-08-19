import React, { forwardRef } from 'react';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Editor, Path } from 'slate';
import { ReactEditor, RenderElementProps, useEditor } from 'slate-react';
import { Selectable } from './Selectable';
import {
  ElementWithId,
  SelectableStyleProps,
  SelectableStyles,
} from './Selectable.types';

export interface GetSelectabelElementOptions {
  component: any;
  styles?: IStyleFunctionOrObject<SelectableStyleProps, SelectableStyles>;
  level?: number;
  filter?: (editor: Editor, path: Path) => boolean;
}

export const getSelectableElement = ({
  component: Component,
  styles,
  level,
  filter,
}: GetSelectabelElementOptions) => {
  return forwardRef(
    ({ attributes, element, ...props }: RenderElementProps, ref) => {
      const editor = useEditor();
      const path = ReactEditor.findPath(editor, element);
      if (
        (level && level !== path.length - 1) ||
        (filter && filter(editor, path))
      ) {
        return (
          <Component attributes={attributes} element={element} {...props} />
        );
      }
      return (
        <Selectable
          attributes={attributes}
          componentRef={ref}
          element={element as ElementWithId}
          styles={styles}
        >
          <Component attributes={attributes} element={element} {...props} />
        </Selectable>
      );
    }
  );
};
