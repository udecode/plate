import type { PlateEditor } from '@udecode/plate/react';

import {
  type InsertNodesOptions,
  type Path,
  nanoid,
  PathApi,
} from '@udecode/plate';

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
        files: Array.from(files),
        fileType: null,
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
        files: Array.from(files),
        fileType: null,
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
      currentAt = currentAt ? PathApi.next(currentAt) : undefined;
    }

    const id = nanoid();

    api.placeholder.addUploadingFile(id, file);

    const insert = () => {
      editor.tf.insertNodes<TPlaceholderElement>(
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
      editor.tf.withoutMerging(() => {
        withHistoryMark(editor, insert);
      });
    } else {
      editor.tf.withoutNormalizing(insert);
    }
  });
};
