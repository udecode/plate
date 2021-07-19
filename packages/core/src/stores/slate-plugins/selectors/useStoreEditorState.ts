import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../../../types/SPEditor';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';
import { useStoreEditorRef } from './useStoreEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const useStoreEditorState = <
  T extends SPEditor = SPEditor & ReactEditor & HistoryEditor
>(
  id?: string | null
) => {
  usePlateStore((state) => getPlateState<T>(state as any, id)?.keyChange);

  return useStoreEditorRef(id);
};
