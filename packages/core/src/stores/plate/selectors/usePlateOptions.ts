import { usePlateEditorRef } from './usePlateEditorRef';

export const usePlateOptions = (id?: string | null) =>
  usePlateEditorRef(id)?.options;
