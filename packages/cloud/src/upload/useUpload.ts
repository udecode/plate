import { usePlateEditorRef } from '@udecode/plate-common';
import { PlateCloudEditor } from '../cloud/types';
import { Upload } from './types';

/**
 * Takes an `element` (which it only needs for its `id`) and returns the
 * Upload object from it.
 */
export const useUpload = (id: string): Upload => {
  const editor = usePlateEditorRef() as PlateCloudEditor;

  /**
   * We call this even if it's not always required because it calls `useStore`
   * which is a React hook which means it needs to be called consistently.
   */
  // const upload: Upload = editor.cloud.useUploadStore(
  //   (state) => state.uploads[id] || { status: 'not-found' }
  // );
  const upload: Upload = editor.cloud.uploadStore.use.upload(id) || {
    status: 'not-found',
  };

  // (
  //   (state) => state.uploads[id] || { status: 'not-found' }
  // );
  if (id.includes('/')) {
    return {
      status: 'success',
      url: id,
    };
  }
  return upload;
};
