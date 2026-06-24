import {
  type Path,
  type TPlaceholderElement,
  KEYS,
  nanoid,
  PathApi,
} from 'platejs';
import type { NodeInsertNodesOptions } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

import { type PlaceholderApi, PlaceholderPlugin } from '../PlaceholderPlugin';
import { UploadErrorCode } from '../type';
import { createUploadError, isUploadError } from '../utils/createUploadError';
import { getMediaType } from '../utils/getMediaType';
import { validateFiles } from '../utils/validateFiles';

type InsertNodesOptions = NodeInsertNodesOptions<TPlaceholderElement> & {
  nextBlock?: boolean;
};

type PlaceholderEditor = PlateEditor & {
  api: PlateEditor['api'] & { placeholder: PlaceholderApi };
};

const getNextBlockInsertLocation = (
  editor: PlateEditor,
  at: InsertNodesOptions['at']
) => {
  const location = at ?? editor.selection;

  if (!location) return at;

  const endPoint = editor.api.end(location);
  const blockEntry = endPoint ? editor.api.block({ at: endPoint }) : undefined;

  return blockEntry ? PathApi.next(blockEntry[1]) : at;
};

export const insertMedia = (
  editor: PlateEditor,
  files: FileList,
  options?: Omit<InsertNodesOptions, 'at'> & { at?: Path }
): void => {
  const placeholderApi = (editor as PlaceholderEditor).api.placeholder;
  const uploadConfig = editor.getOption(PlaceholderPlugin, 'uploadConfig');
  const multiple = editor.getOption(PlaceholderPlugin, 'multiple');

  try {
    validateFiles(files, uploadConfig);
  } catch (error) {
    if (!isUploadError(error)) throw error;

    editor.setOption(PlaceholderPlugin, 'error', error);

    return;
  }

  if (!multiple && files.length > 1) {
    editor.setOption(
      PlaceholderPlugin,
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        files: Array.from(files),
        fileType: null,
        maxFileCount: 1,
      })
    );

    return;
  }

  const maxFileCount = editor.getOption(PlaceholderPlugin, 'maxFileCount') ?? 3;

  if (files.length > maxFileCount) {
    editor.setOption(
      PlaceholderPlugin,
      'error',
      createUploadError(UploadErrorCode.TOO_MANY_FILES, {
        files: Array.from(files),
        fileType: null,
        maxFileCount,
      })
    );

    return;
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

    placeholderApi.addUploadingFile(id, file);

    const insert = (metadata?: Parameters<PlateEditor['update']>[1]) => {
      editor.update((tx) => {
        tx.nodes.insert<TPlaceholderElement>(
          {
            id,
            children: [{ text: '' }],
            mediaType: getMediaType(file, uploadConfig)!,
            type: editor.getType(KEYS.placeholder),
          },
          {
            ...restOptions,
            at: nextBlock
              ? getNextBlockInsertLocation(editor, currentAt)
              : currentAt,
          }
        );
      }, metadata);
    };

    const insertWithoutNormalizing = () => {
      editor.update((tx) => {
        tx.withoutNormalizing(() => {
          tx.nodes.insert<TPlaceholderElement>(
            {
              id,
              children: [{ text: '' }],
              mediaType: getMediaType(file, uploadConfig)!,
              type: editor.getType(KEYS.placeholder),
            },
            {
              ...restOptions,
              at: nextBlock
                ? getNextBlockInsertLocation(editor, currentAt)
                : currentAt,
            }
          );
        });
      });
    };

    const disableEmptyPlaceholder = editor.getOption(
      PlaceholderPlugin,
      'disableEmptyPlaceholder'
    );

    if (disableEmptyPlaceholder) {
      insert({ metadata: { history: { mode: 'push' } } });
    } else {
      insertWithoutNormalizing();
    }
  });
};
