import { type InferConfig, nanoid } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';
import { createAtomStore } from '@platejs/core/react/internal';
import {
  type NodeInsertNodesOptions,
  NodeApi,
  type Path,
  PathApi,
} from '@platejs/plite';
import {
  KEYS,
  type TMediaElement,
  type TPlaceholderElement,
} from '@platejs/utils';

import type {
  AlignedMediaInsertInput,
  ImageInsertInput,
  MediaInsertInput,
  ProviderMediaInsertInput,
} from '../../lib/BaseMediaPlugin';
import { BasePlaceholderPlugin } from '../../lib/placeholder/BasePlaceholderPlugin';
import { AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin } from '../plugins';
import { lookup } from './internal/mimeTypes';

const fileSizePattern = /^(\d+)(\.\d+)?\s*(B|KB|MB|GB)$/i;

export const { PlaceholderProvider } = createAtomStore(
  {},
  { name: 'placeholder' as const }
);

export const ALLOWED_FILE_TYPES = [
  'image',
  'video',
  'audio',
  'pdf',
  'text',
  'blob',
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export const UploadErrorCode = {
  INVALID_FILE_TYPE: 400,
  TOO_MANY_FILES: 402,
  INVALID_FILE_SIZE: 403,
  TOO_LESS_FILES: 405,
  TOO_LARGE: 413,
} as const;

export type UploadErrorCode =
  (typeof UploadErrorCode)[keyof typeof UploadErrorCode];

type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;

export type FileSize = `${PowOf2}${SizeUnit}`;

export type MediaKeys =
  | typeof KEYS.audio
  | typeof KEYS.file
  | typeof KEYS.img
  | typeof KEYS.video;

export type MediaItemConfig = {
  /** Media node type inserted after upload. */
  mediaType: MediaKeys;
  /** Maximum files allowed for this media category. */
  maxFileCount?: number;
  /** Maximum size of one file. */
  maxFileSize?: FileSize;
  /** Minimum files required for this media category. */
  minFileCount?: number;
};

export type SizeUnit = 'B' | 'GB' | 'KB' | 'MB';

export type UploadError =
  | {
      code: typeof UploadErrorCode.INVALID_FILE_SIZE;
      data: { files: File[] };
    }
  | {
      code: typeof UploadErrorCode.INVALID_FILE_TYPE;
      data: { allowedTypes: string[]; files: File[] };
    }
  | {
      code: typeof UploadErrorCode.TOO_LARGE;
      data: {
        fileType: AllowedFileType;
        files: File[];
        maxFileSize: string;
      };
    }
  | {
      code: typeof UploadErrorCode.TOO_LESS_FILES;
      data: {
        fileType: AllowedFileType;
        files: File[];
        minFileCount: number;
      };
    }
  | {
      code: typeof UploadErrorCode.TOO_MANY_FILES;
      data: {
        fileType: AllowedFileType | null;
        files: File[];
        maxFileCount: number;
      };
    };

export type UploadConfig = Partial<Record<AllowedFileType, MediaItemConfig>>;

export type InsertMediaOptions = Omit<
  NodeInsertNodesOptions<TPlaceholderElement>,
  'at'
> & { at?: Path };

export type PlaceholderPluginState = {
  disableEmptyPlaceholder: boolean;
  disableFileDrop: boolean;
  error: UploadError | null;
  maxFileCount: number;
  /** Whether multiple files can be uploaded in one update. */
  multiple: boolean;
  uploadConfig: UploadConfig;
  uploadingFiles: Record<string, File>;
};

type ErrorData<T extends UploadErrorCode> = Extract<
  UploadError,
  { code: T }
>['data'];

const createUploadError = <T extends UploadErrorCode>(
  code: T,
  data: ErrorData<T>
) => ({ code, data });

const isUploadError = (error: unknown): error is UploadError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  'data' in error &&
  typeof error.data === 'object' &&
  error.data !== null &&
  'files' in error.data &&
  Array.isArray(error.data.files);

const initialState: PlaceholderPluginState = {
  disableEmptyPlaceholder: false,
  disableFileDrop: false,
  error: null,
  maxFileCount: 5,
  multiple: true,
  uploadConfig: {
    audio: {
      maxFileCount: 1,
      maxFileSize: '8MB',
      mediaType: KEYS.audio,
      minFileCount: 1,
    },
    blob: {
      maxFileCount: 1,
      maxFileSize: '8MB',
      mediaType: KEYS.file,
      minFileCount: 1,
    },
    image: {
      maxFileCount: 3,
      maxFileSize: '4MB',
      mediaType: KEYS.img,
      minFileCount: 1,
    },
    pdf: {
      maxFileCount: 1,
      maxFileSize: '4MB',
      mediaType: KEYS.file,
      minFileCount: 1,
    },
    text: {
      maxFileCount: 1,
      maxFileSize: '64KB',
      mediaType: KEYS.file,
      minFileCount: 1,
    },
    video: {
      maxFileCount: 1,
      maxFileSize: '16MB',
      mediaType: KEYS.video,
      minFileCount: 1,
    },
  },
  uploadingFiles: {},
};

export const PlaceholderPlugin = toPlatePlugin(BasePlaceholderPlugin, {
  dependencies: [AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin],
  initialState,
})
  .extend(({ store }) => ({
    api: {
      addUploadingFile: (id: string, file: File) => {
        store.set({
          uploadingFiles: {
            ...store.get('uploadingFiles'),
            [id]: file,
          },
        });
      },
      removeUploadingFile: (id: string) => {
        const uploadingFiles = { ...store.get('uploadingFiles') };

        delete uploadingFiles[id];
        store.set({ uploadingFiles });
      },
    },
    selectors: {
      uploadingFile: (
        state: Readonly<{ uploadingFiles: Record<string, File> }>,
        id: string
      ): File | undefined => state.uploadingFiles[id],
    },
  }))
  .extend(({ api, editor, store, type }) => ({
    update: ({ context: { afterCommit }, tx }) => ({
      insertMedia: (files: File[] | FileList, options?: InsertMediaOptions) => {
        const uploadConfig = store.get('uploadConfig');
        let fileTypes: Map<File, AllowedFileType>;

        try {
          const allowedTypes = Object.keys(uploadConfig) as AllowedFileType[];
          const filesByType: Record<AllowedFileType, File[]> = {
            audio: [],
            blob: [],
            image: [],
            pdf: [],
            text: [],
            video: [],
          };

          fileTypes = new Map();

          for (const file of files) {
            const mimeType = file.type || lookup(file.name);
            let fileType: AllowedFileType;

            if (!mimeType) {
              if (!allowedTypes.includes('blob')) {
                throw createUploadError(UploadErrorCode.INVALID_FILE_TYPE, {
                  allowedTypes,
                  files: [file],
                });
              }

              fileType = 'blob';
            } else {
              const matchedType = (
                mimeType.toLowerCase() === 'application/pdf'
                  ? 'pdf'
                  : mimeType.split('/')[0]
              ) as AllowedFileType;

              if (allowedTypes.includes(matchedType)) {
                fileType = matchedType;
              } else if (allowedTypes.includes('blob')) {
                fileType = 'blob';
              } else {
                throw createUploadError(UploadErrorCode.INVALID_FILE_TYPE, {
                  allowedTypes,
                  files: [file],
                });
              }
            }

            filesByType[fileType].push(file);
            fileTypes.set(file, fileType);
          }

          for (const fileType of ALLOWED_FILE_TYPES) {
            const typeFiles = filesByType[fileType];

            if (typeFiles.length === 0) continue;

            const itemConfig = uploadConfig[fileType];

            if (!itemConfig) continue;

            const {
              maxFileCount = Number.POSITIVE_INFINITY,
              maxFileSize,
              minFileCount = 1,
            } = itemConfig;

            if (typeFiles.length < minFileCount) {
              throw createUploadError(UploadErrorCode.TOO_LESS_FILES, {
                fileType,
                files: typeFiles,
                minFileCount,
              });
            }
            if (typeFiles.length > maxFileCount) {
              throw createUploadError(UploadErrorCode.TOO_MANY_FILES, {
                fileType,
                files: typeFiles,
                maxFileCount,
              });
            }
            if (!maxFileSize) continue;

            const match = fileSizePattern.exec(maxFileSize);

            if (!match) {
              throw createUploadError(UploadErrorCode.INVALID_FILE_SIZE, {
                files: typeFiles,
              });
            }

            const bytes =
              Number.parseFloat(match[1]) *
              1024 ** ['B', 'KB', 'MB', 'GB'].indexOf(match[3].toUpperCase());

            for (const file of typeFiles) {
              if (file.size > Math.floor(bytes)) {
                throw createUploadError(UploadErrorCode.TOO_LARGE, {
                  fileType,
                  files: [file],
                  maxFileSize,
                });
              }
            }
          }
        } catch (error) {
          if (!isUploadError(error)) throw error;

          store.set({ error });

          return;
        }

        if (!store.get('multiple') && files.length > 1) {
          store.set({
            error: createUploadError(UploadErrorCode.TOO_MANY_FILES, {
              fileType: null,
              files: Array.from(files),
              maxFileCount: 1,
            }),
          });

          return;
        }

        const maxFileCount = store.get('maxFileCount') ?? 3;

        if (files.length > maxFileCount) {
          store.set({
            error: createUploadError(UploadErrorCode.TOO_MANY_FILES, {
              fileType: null,
              files: Array.from(files),
              maxFileCount,
            }),
          });

          return;
        }

        let currentAt = options?.at;

        if (currentAt === undefined) {
          const selection = tx.selection();
          const block = selection ? tx.nodes.block({ at: selection }) : null;

          if (block) currentAt = PathApi.next(block[1]);
        }

        const { at: _at, ...restOptions } = options ?? {};

        if (store.get('disableEmptyPlaceholder')) {
          tx.tags.add('history-push');
        }

        for (const [index, file] of Array.from(files).entries()) {
          if (index > 0) {
            currentAt = currentAt ? PathApi.next(currentAt) : undefined;
          }

          const fileType = fileTypes.get(file);
          const mediaType = fileType
            ? uploadConfig[fileType]?.mediaType
            : undefined;

          if (!mediaType) continue;

          const id = nanoid();

          afterCommit(() => api.addUploadingFile(id, file));
          tx.nodes.insert<TPlaceholderElement>(
            {
              id,
              children: [{ text: '' }],
              mediaType,
              type,
            },
            { ...restOptions, at: currentAt }
          );
        }
      },
      replaceMedia: (
        {
          type: mediaType,
          ...input
        }:
          | (AlignedMediaInsertInput & { type: string })
          | (ImageInsertInput & { type: string })
          | (MediaInsertInput & { type: string })
          | (ProviderMediaInsertInput & { type: string }),
        {
          at,
          ...options
        }: Omit<NodeInsertNodesOptions<TMediaElement>, 'at'> & { at: Path }
      ) => {
        const audioType = editor.getType(KEYS.audio);
        const fileType = editor.getType(KEYS.file);
        const imageType = editor.getType(KEYS.img);
        const videoType = editor.getType(KEYS.video);

        if (
          mediaType !== audioType &&
          mediaType !== fileType &&
          mediaType !== imageType &&
          mediaType !== videoType
        ) {
          throw new Error(`Unsupported placeholder media type "${mediaType}".`);
        }

        tx.nodes.remove({ at });
        if (mediaType === audioType) {
          tx.audio.insert(input, { ...options, at });
        } else if (mediaType === fileType) {
          tx.file.insert(input, { ...options, at });
        } else if (mediaType === imageType) {
          tx.img.insert(input, { ...options, at });
        } else {
          tx.video.insert(input, { ...options, at });
        }
      },
    }),
  }))
  .extend(({ editor, store, update }) => ({
    handlers: {
      onDrop: ({ event }) => {
        // The DnD plugin owns file drops unless explicitly disabled.
        if (!store.get('disableFileDrop')) return;

        const { files } = event.dataTransfer;

        if (files.length === 0) return false;

        event.preventDefault();
        event.stopPropagation();

        const at = editor.api.dom.resolveEventRange(event);

        if (!at) return false;

        update.insertMedia(files, { at: at.focus.path });

        return true;
      },
      onPaste: ({ event }) => {
        const { files, types } = event.clipboardData;

        if (files.length === 0 || types.includes('text/html')) return false;

        event.preventDefault();
        event.stopPropagation();

        const ancestor = editor.read.nodes.block();

        if (ancestor && NodeApi.string(ancestor[0]).length === 0) {
          editor.update((tx) => {
            tx.nodes.remove({ at: ancestor[1] });
            tx.placeholder.insertMedia(files, { at: ancestor[1] });
          });

          return true;
        }

        update.insertMedia(files, {
          at: ancestor ? PathApi.next(ancestor[1]) : undefined,
        });

        return true;
      },
    },
  }));

export type PlaceholderPluginConfig = InferConfig<typeof PlaceholderPlugin>;
