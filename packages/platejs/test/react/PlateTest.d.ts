import type { Editor, PlateContentProps, PlateProps } from '../../src/react';
import type { EditorReference } from '../../src/react/editor/Editor';

export declare function PlateTest<E extends EditorReference = Editor>({
  editableProps,
  editor,
  variant,
  ...props
}: Omit<PlateProps<E>, 'children' | 'editor'> & {
  editableProps?: PlateContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
}): import('react/jsx-runtime').JSX.Element;
