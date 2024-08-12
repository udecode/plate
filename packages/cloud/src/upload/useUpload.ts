import { getEditorApi } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-common/react';

import type { Upload } from './types';

import { CloudPlugin } from '../cloud';

/**
 * Takes an `element` (which it only needs for its `id`) and returns the Upload
 * object from it.
 */
export const useUpload = (id: string): Upload => {
  const editor = useEditorRef();

  const api = getEditorApi(editor, CloudPlugin);

  /**
   * We call this even if it's not always required because it calls `useStore`
   * which is a React hook which means it needs to be called consistently.
   */
  // const upload: Upload = editor.cloud.useUploadStore(
  //   (state) => state.uploads[id] || { status: 'not-found' }
  // );
  const upload: Upload = api.cloud.uploadStore.use.upload(id) || {
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
