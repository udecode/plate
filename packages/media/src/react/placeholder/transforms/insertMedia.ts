import type { PlateEditor } from '@udecode/plate-common/react';

import { insertNodes, nanoid, withoutNormalizing } from '@udecode/plate-common';
import { Path } from 'slate';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { PlaceholderPlugin } from '../PlaceholderPlugin';
import { UploadErrorCode } from '../type';
import { createUploadError, isUploadError } from '../utils/createUploadError';
import { getMediaType } from '../utils/getMediaType';
import { validateFiles } from '../utils/validateFiles';

export const insertMedia = (
  editor: PlateEditor,
  files: FileList,
  at?: Path
): any => {
  const api = editor.getApi(PlaceholderPlugin);
  const uploadConfig = editor.getOption(PlaceholderPlugin, 'uploadConfig');
  const multiple = editor.getOption(PlaceholderPlugin, 'multiple');

  try {
    validateFiles(files, uploadConfig);
  } catch (error) {
    if (!isUploadError(error)) throw error;

    return editor.setOption(PlaceholderPlugin, 'error', error);
  }

  if (!multiple && files.length > 1) {
    return editor.setOption(
      PlaceholderPlugin,
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        fileType: null,
        files: Array.from(files),
        maxFileCount: 1,
      })
    );
  }

  const maxFileCount = editor.getOption(PlaceholderPlugin, 'maxFileCount') ?? 3;

  if (files.length > maxFileCount) {
    return editor.setOption(
      PlaceholderPlugin,
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        fileType: null,
        files: Array.from(files),
        maxFileCount,
      })
    );
  }

  let currentAt: Path | undefined;

  Array.from(files).forEach((file, index) => {
    if (index === 0) {
      if (at) {
        currentAt = at;
      }
    } else {
      currentAt = currentAt ? Path.next(currentAt) : undefined;
    }

    const id = nanoid();

    withoutNormalizing(editor, () =>
      insertNodes<TPlaceholderElement>(
        editor,
        {
          id,
          children: [{ text: '' }],
          mediaType: getMediaType(file, uploadConfig)!,
          type: editor.getType(BasePlaceholderPlugin),
        },
        { at: currentAt, nextBlock: false }
      )
    );

    api.placeholder.addUploadingFile(id, file);
  });
};
