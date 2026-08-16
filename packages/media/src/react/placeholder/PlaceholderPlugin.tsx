import type {
  DefinitionOf,
  PlateNodeInsertOptions,
  PluginReference,
} from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';
import { createAtomStore } from '@platejs/core/react/internal';
import { NodeApi, type Path, PathApi, type NodeKey } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

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

export type MediaKeys = 'audio' | 'file' | 'image' | 'video';
type PlaceholderMediaPlugin = MediaKeys | PluginReference<MediaKeys>;

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

export type InsertMediaOptions = Omit<PlateNodeInsertOptions, 'at'> & {
  at?: Path;
};

export type PlaceholderPluginState = {
  disableEmptyPlaceholder: boolean;
  disableFileDrop: boolean;
  error: UploadError | null;
  maxFileCount: number;
  /** Whether multiple files can be uploaded in one update. */
  multiple: boolean;
  uploadConfig: UploadConfig;
  uploadingFiles: Partial<Record<NodeKey, File>>;
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
      mediaType: 'audio',
      minFileCount: 1,
    },
    blob: {
      maxFileCount: 1,
      maxFileSize: '8MB',
      mediaType: 'file',
      minFileCount: 1,
    },
    image: {
      maxFileCount: 3,
      maxFileSize: '4MB',
      mediaType: 'image',
      minFileCount: 1,
    },
    pdf: {
      maxFileCount: 1,
      maxFileSize: '4MB',
      mediaType: 'file',
      minFileCount: 1,
    },
    text: {
      maxFileCount: 1,
      maxFileSize: '64KB',
      mediaType: 'file',
      minFileCount: 1,
    },
    video: {
      maxFileCount: 1,
      maxFileSize: '16MB',
      mediaType: 'video',
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
    api: () => ({
      addUploadingFile: (key: NodeKey, file: File) => {
        store.set({
          uploadingFiles: {
            ...store.get('uploadingFiles'),
            [key]: file,
          },
        });
      },
      removeUploadingFile: (key: NodeKey) => {
        const uploadingFiles = { ...store.get('uploadingFiles') };

        delete uploadingFiles[key];
        store.set({ uploadingFiles });
      },
    }),
    selectors: {
      uploadingFile: (
        state: Readonly<{
          uploadingFiles: Partial<Record<NodeKey, File>>;
        }>,
        key: NodeKey
      ): File | undefined => state.uploadingFiles[key],
    },
  }))
  .extend(({ api, editor, store, schema: { type } }) => ({
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

        const insertedUploads: [NodeKey, File][] = [];

        for (const [index, file] of Array.from(files).entries()) {
          if (index > 0) {
            currentAt = currentAt ? PathApi.next(currentAt) : undefined;
          }

          const fileType = fileTypes.get(file);
          const mediaType = fileType
            ? uploadConfig[fileType]?.mediaType
            : undefined;

          if (!mediaType) continue;

          const element = tx.schema.create(type, { mediaType });

          tx.nodes.insert(element, {
            ...restOptions,
            at: currentAt,
          });
          insertedUploads.push([tx.key(element), file]);
        }

        if (insertedUploads.length > 0) {
          afterCommit(({ editor }) => {
            for (const [nodeKey, file] of insertedUploads) {
              const entry = editor.read.nodes.get(nodeKey);

              if (
                entry &&
                NodeApi.isElement(entry[0]) &&
                entry[0].type === type
              ) {
                api.addUploadingFile(nodeKey, file);
              }
            }
          });
        }
      },
      replaceMedia: (
        {
          plugin: mediaPlugin,
          ...input
        }:
          | (AlignedMediaInsertInput & { plugin: PlaceholderMediaPlugin })
          | (ImageInsertInput & { plugin: PlaceholderMediaPlugin })
          | (MediaInsertInput & { plugin: PlaceholderMediaPlugin })
          | (ProviderMediaInsertInput & { plugin: PlaceholderMediaPlugin }),
        {
          at,
          ...options
        }: Omit<PlateNodeInsertOptions, 'at'> & {
          at: Path;
        }
      ) => {
        const media = editor.plugin(mediaPlugin);
        const mediaName = media.name;

        if (
          !media.installed ||
          (mediaName !== PLUGINS.audio &&
            mediaName !== PLUGINS.file &&
            mediaName !== PLUGINS.image &&
            mediaName !== PLUGINS.video)
        ) {
          throw new Error(
            `Unsupported placeholder media plugin "${mediaName}".`
          );
        }

        tx.nodes.remove({ at });
        if (mediaName === PLUGINS.audio) {
          tx.audio.insert(input, { ...options, at });
        } else if (mediaName === PLUGINS.file) {
          tx.file.insert(input, { ...options, at });
        } else if (mediaName === PLUGINS.image) {
          tx.image.insert(input, { ...options, at });
        } else {
          tx.video.insert(input, { ...options, at });
        }
      },
    }),
  }))
  .extend(({ editor, plugin, store, update }) => ({
    on: {
      drop: ({ event }) => {
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
      paste: ({ event }) => {
        const { files, types } = event.clipboardData;

        if (files.length === 0 || types.includes('text/html')) return false;

        event.preventDefault();
        event.stopPropagation();

        const ancestor = editor.read.nodes.block();

        if (ancestor && NodeApi.string(ancestor[0]).length === 0) {
          editor.update((tx) => {
            tx.nodes.remove({ at: ancestor[1] });
            tx.plugin(plugin).insertMedia(files, { at: ancestor[1] });
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

export type PlaceholderDefinition = DefinitionOf<typeof PlaceholderPlugin>;
