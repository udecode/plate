import {
  type NodeInsertNodesOptions,
  type Path,
  PathApi,
} from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { nanoid } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import type { PlateEditor } from 'platejs/react';

import { PlaceholderPlugin } from '../PlaceholderPlugin';
import { UploadErrorCode } from '../type';
import { createUploadError, isUploadError } from '../utils/createUploadError';
import { getMediaType } from '../utils/getMediaType';
import { validateFiles } from '../utils/validateFiles';

export type InsertMediaOptions = Omit<
  NodeInsertNodesOptions<TPlaceholderElement>,
  'at'
> & { at?: Path };

export const insertMedia = (
  editor: PlateEditor,
  files: FileList,
  options?: InsertMediaOptions
): any => {
  const api = editor.plugin(PlaceholderPlugin).api;
  const uploadConfig = editor
    .plugin(PlaceholderPlugin)
    .getOption('uploadConfig');
  const multiple = editor.plugin(PlaceholderPlugin).getOption('multiple');

  try {
    validateFiles(files, uploadConfig);
  } catch (error) {
    if (!isUploadError(error)) throw error;

    return editor.plugin(PlaceholderPlugin).setOption('error', error);
  }

  if (!multiple && files.length > 1) {
    return editor.plugin(PlaceholderPlugin).setOption(
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        files: Array.from(files),
        fileType: null,
        maxFileCount: 1,
      })
    );
  }

  const maxFileCount =
    editor.plugin(PlaceholderPlugin).getOption('maxFileCount') ?? 3;

  if (files.length > maxFileCount) {
    return editor.plugin(PlaceholderPlugin).setOption(
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        files: Array.from(files),
        fileType: null,
        maxFileCount,
      })
    );
  }

  let currentAt = options?.at;

  if (currentAt === undefined) {
    const selection = editor.read.selection();
    const block = selection ? editor.read.nodes.block({ at: selection }) : null;

    if (block) currentAt = PathApi.next(block[1]);
  }

  const { at: _at, ...restOptions } = options ?? {};

  Array.from(files).forEach((file, index) => {
    if (index > 0) {
      currentAt = currentAt ? PathApi.next(currentAt) : undefined;
    }

    const id = nanoid();

    api.addUploadingFile(id, file);

    const insert = () => {
      editor.update.nodes.insert(
        {
          id,
          children: [{ text: '' }],
          mediaType: getMediaType(file, uploadConfig)!,
          type: editor.getType(KEYS.placeholder),
        },
        { ...restOptions, at: currentAt }
      );
    };

    const disableEmptyPlaceholder = editor
      .plugin(PlaceholderPlugin)
      .getOption('disableEmptyPlaceholder');

    if (disableEmptyPlaceholder) {
      editor.update.history.newBatch(insert);
    } else {
      insert();
    }
  });
};
