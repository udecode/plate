import type { PlateEditor } from '@udecode/plate-common/react';

import { insertNodes, nanoid, withoutNormalizing } from '@udecode/plate-common';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { PlaceholderPlugin } from '../PlaceholderPlugin';
import { UploadErrorCode } from '../type';
import { createUploadError, isUploadError } from '../utils/createUploadError';
import { getMediaType } from '../utils/getMediaType';
import { validateFiles } from '../utils/validateFiles';

export const insertMedia = (editor: PlateEditor, files: FileList): any => {
  const api = editor.getApi(PlaceholderPlugin);
  const uploadConfig = editor.getOption(PlaceholderPlugin, 'uploadConfig');
  const multiple = editor.getOption(PlaceholderPlugin, 'multiple');

  try {
    validateFiles(files, uploadConfig);
  } catch (error) {
    if (!isUploadError(error)) throw error;

    return editor.setOption(PlaceholderPlugin, 'uploadError', error);
  }

  if (!multiple && files.length > 1) {
    return editor.setOption(
      PlaceholderPlugin,
      'uploadError',
      createUploadError(UploadErrorCode.MaxFileCountExceeded, {
        invalidateFiles: Array.from(files),
      })
    );
  }

  const maxFileCount =
    editor.getOption(PlaceholderPlugin, 'uploadMaxFileCount') ?? 3;

  if (files.length > maxFileCount) {
    return editor.setOption(
      PlaceholderPlugin,
      'uploadError',
      createUploadError(UploadErrorCode.MaxFileCountExceeded, {
        invalidateFiles: Array.from(files),
      })
    );
  }

  Array.from(files).forEach((file) => {
    const id = nanoid();

    withoutNormalizing(editor, () =>
      insertNodes<TPlaceholderElement>(editor, {
        id,
        children: [{ text: '' }],
        mediaType: getMediaType(file, uploadConfig)!,
        type: editor.getType(BasePlaceholderPlugin),
      })
    );

    api.placeholder.addUploadingFile(id, file);
  });
};
