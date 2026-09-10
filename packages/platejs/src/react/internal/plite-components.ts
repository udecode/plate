import { useEditorContext as usePliteEditorContext } from 'plitejs/react';

import type { Editor } from '../editor/Editor';

export { Editable, Plite } from 'plitejs/react';
export type { EditableProps } from 'plitejs/react';

export const useEditorContext = (): Editor =>
  usePliteEditorContext() as unknown as Editor;
