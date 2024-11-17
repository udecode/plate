import type { PlateEditor } from '@udecode/plate-common/react';

import {
  type InsertNodesOptions,
  insertNodes,
  nanoid,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { PlaceholderPlugin } from '../PlaceholderPlugin';
import { UploadErrorCode } from '../type';
import { createUploadError, isUploadError } from '../utils/createUploadError';
import { getMediaType } from '../utils/getMediaType';
import { withHistoryMark } from '../utils/history';
import { validateFiles } from '../utils/validateFiles';

export const insertMedia = (
  editor: PlateEditor,
  files: FileList,
  options?: Omit<InsertNodesOptions, 'at'> & { at?: Path }
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
  const { at, nextBlock = true, ...restOptions } = options ?? {};

  Array.from(files).forEach((file, index) => {
    if (index === 0) {
      if (at) {
        currentAt = at;
      }
    } else {
      currentAt = currentAt ? Path.next(currentAt) : undefined;
    }

    const id = nanoid();

    api.placeholder.addUploadingFile(id, file);

    const insert = () => {
      insertNodes<TPlaceholderElement>(
        editor,
        {
          id,
          children: [{ text: '' }],
          mediaType: getMediaType(file, uploadConfig)!,
          type: editor.getType(BasePlaceholderPlugin),
        },
        { at: currentAt, nextBlock, ...restOptions }
      );
    };

    const disableEmptyPlaceholder = editor.getOption(
      PlaceholderPlugin,
      'disableEmptyPlaceholder'
    );

    if (disableEmptyPlaceholder) {
      withHistoryMark(editor, insert);
    } else {
      withoutNormalizing(editor, insert);
    }
  });
};
