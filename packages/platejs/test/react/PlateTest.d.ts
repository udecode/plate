import type {
  Editor,
  EditorContentProps,
  EditorRootProps,
} from '../../src/react';
import type { EditorReference } from '../../src/react/editor/Editor';

export declare function EditorTest<E extends EditorReference = Editor>({
  editableProps,
  editor,
  variant,
  ...props
}: Omit<EditorRootProps<E>, 'children' | 'editor'> & {
  editableProps?: EditorContentProps;
  editor: E;
  variant?: 'comment' | 'wordProcessor';
}): import('react/jsx-runtime').JSX.Element;
