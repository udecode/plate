import { useStoreEditorRef } from './useStoreEditorRef';

export const useStoreEditorOptions = (id?: string | null) =>
  useStoreEditorRef(id)?.options;
