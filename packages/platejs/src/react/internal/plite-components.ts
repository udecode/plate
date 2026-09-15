import {
  EditorRoot as NativeEditorRoot,
  type EditorRootProps as NativeEditorRootProps,
  useEditorContext as usePliteEditorContext,
  useOptionalEditorContext as useOptionalPliteEditorContext,
} from 'plitejs/react';

import type { EditorViewOptions } from '../../facade';
import type { Editor } from '../editor/Editor';

export { Editable } from 'plitejs/react';
export type { EditableProps } from 'plitejs/react';

// The public Plate root checks capability inference before private composition
// carries view policy alongside the erased editor specialization.
export const EditorRoot = NativeEditorRoot as (
  props: Omit<NativeEditorRootProps<Editor>, 'authored'> &
    Pick<EditorViewOptions, 'authored'>
) => React.ReactElement;

export const useEditorContext = (): Editor =>
  usePliteEditorContext() as unknown as Editor;

export const useOptionalEditorContext = (): Editor | null =>
  useOptionalPliteEditorContext() as unknown as Editor | null;
