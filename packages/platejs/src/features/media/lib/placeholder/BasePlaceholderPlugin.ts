import {
  definePlugin,
  defineEffect,
  NodeApi,
  PLUGINS,
  type ElementOf,
  type NodeKey,
  type Path,
  PathApi,
  type BlockInsertOptions,
  type NodeInsertOptions,
  type PluginReference,
  property,
} from '../../../../core';
import { domCommands } from '../../../../dom/plite-dom.internal';
import { createZustandStore } from '../../../../lib/libs/zustand';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
  type AlignedMediaInsertInput,
  type FileInsertInput,
  type ImageInsertInput,
  type ProviderMediaInsertInput,
} from '../BaseMediaPlugin';
import { BaseImagePlugin } from '../image/BaseImagePlugin';
import { lookup } from './mimeTypes.internal';

const fileSizePattern = /^(\d+)(\.\d+)?\s*(B|KB|MB|GB)$/i;

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

const PLACEHOLDER_MEDIA_PLUGINS = {
  audio: BaseAudioPlugin,
  file: BaseFilePlugin,
  image: BaseImagePlugin,
  video: BaseVideoPlugin,
} as const;

const resolvePlaceholderMediaPlugin = (
  plugin: PluginReference<MediaKeys> | string
) => {
  if (typeof plugin !== 'string') return plugin;
  if (!Object.hasOwn(PLACEHOLDER_MEDIA_PLUGINS, plugin)) return undefined;

  return PLACEHOLDER_MEDIA_PLUGINS[plugin as MediaKeys];
};

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

export type InsertMediaOptions = Omit<BlockInsertOptions, 'at'> & {
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
  upload: MediaUploadTransport | null;
  uploads: Partial<Record<NodeKey, MediaUpload>>;
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
  maxFileCount: Number.POSITIVE_INFINITY,
  multiple: true,
  upload: null,
  uploadConfig: {
    audio: { mediaType: 'audio' },
    blob: { mediaType: 'file' },
    image: { mediaType: 'image' },
    pdf: { mediaType: 'file' },
    text: { mediaType: 'file' },
    video: { mediaType: 'video' },
  },
  uploads: {},
};

const placeholderValidationEffect = defineEffect({
  collab: 'local',
  history: 'skip',
  key: 'plate.placeholder.validation',
});

export type MediaUploadState = Readonly<{
  error: unknown;
  progress: number;
  status: 'error' | 'uploading';
}>;

/** One editor-owned request with progress independent of a mounted preview. */
export type MediaUpload = Readonly<{
  file: File;
  getSnapshot: () => MediaUploadState;
  subscribe: (listener: () => void) => () => void;
}>;

export type MediaUploadResult = {
  url: string;
  name?: string;
  naturalHeight?: number;
  naturalWidth?: number;
};

export type MediaUploadTransport = (
  file: File,
  options: { onProgress: (progress: number) => void; signal: AbortSignal }
) => Promise<MediaUploadResult>;

export const BasePlaceholderPlugin = definePlugin(PLUGINS.placeholder, {
  dependencies: [
    BaseAudioPlugin,
    BaseFilePlugin,
    BaseImagePlugin,
    BaseVideoPlugin,
  ],
  initialState,
  effectTypes: [placeholderValidationEffect],
  schema: {
    element: {
      properties: { mediaType: property.string({ required: true }) },
      void: 'block',
    },
  },
  selectors: {
    uploadTask: (state, key: NodeKey) => state.uploads[key],
  },
})
  .extend(({ editor, schema: { type } }) => ({
    update: ({ tx }) => ({
      replaceMedia: (
        {
          plugin: mediaPlugin,
          ...input
        }:
          | (AlignedMediaInsertInput & { plugin: PlaceholderMediaPlugin })
          | (FileInsertInput & { plugin: PlaceholderMediaPlugin })
          | (ImageInsertInput & { plugin: PlaceholderMediaPlugin })
          | (ProviderMediaInsertInput & { plugin: PlaceholderMediaPlugin }),
        options: Omit<NodeInsertOptions, 'at'> & {
          at: Path;
        }
      ) => {
        const { at } = options;
        const placeholder = tx.nodes.get(at);

        if (
          !placeholder ||
          !NodeApi.isElement(placeholder[0]) ||
          placeholder[0].type !== type
        ) {
          return;
        }

        const mediaDescriptor = resolvePlaceholderMediaPlugin(mediaPlugin);

        if (!mediaDescriptor) {
          const mediaPluginName =
            typeof mediaPlugin === 'string' ? mediaPlugin : mediaPlugin.name;
          throw new Error(
            `Unsupported placeholder media plugin "${mediaPluginName}".`
          );
        }
        const media = editor.plugin(mediaDescriptor);
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
        const normalized =
          mediaName === PLUGINS.audio
            ? editor.plugin(BaseAudioPlugin).api.normalizeUrl(input.url)
            : mediaName === PLUGINS.file
              ? editor.plugin(BaseFilePlugin).api.normalizeUrl(input.url)
              : mediaName === PLUGINS.image
                ? editor.plugin(BaseImagePlugin).api.normalizeUrl(input.url)
                : editor.plugin(BaseVideoPlugin).api.normalizeUrl(input.url);

        if (!normalized) return;

        const { caption, ...properties } = {
          ...input,
          ...normalized,
        };

        tx.nodes.set({ ...properties, type: mediaName }, { at, voids: true });

        if (caption !== undefined) {
          tx.nodes.replaceChildren(
            typeof caption === 'string'
              ? [{ text: caption }]
              : caption.length > 0
                ? caption
                : [{ text: '' }],
            { at, preserveKeys: true }
          );
        }
      },
    }),
  }))
  .extend((context) => {
    const {
      editor,
      store,
      update,
      schema: { type },
    } = context;
    const tasks = new Map<
      NodeKey,
      { controller: AbortController; mediaType: string }
    >();

    const removeUpload = (key: NodeKey) => {
      if (!store.get('uploads')[key]) return;
      const uploads = { ...store.get('uploads') };
      delete uploads[key];
      store.set({ uploads });
    };
    const cancelUpload = (key: NodeKey) => {
      const task = tasks.get(key);
      tasks.delete(key);
      task?.controller.abort();
      removeUpload(key);
    };
    const currentEntry = (key: NodeKey, mediaType: string) => {
      const entry = editor.read.nodes.get(key);
      return entry &&
        NodeApi.isElement(entry[0]) &&
        entry[0].type === type &&
        entry[0].mediaType === mediaType &&
        !editor.read.view.isReadOnly() &&
        !editor.read.nodes.elementReadOnly({ at: key })
        ? entry
        : undefined;
    };
    const validateFiles = (files: File[] | FileList, checkCounts: boolean) => {
      const uploadConfig = store.get('uploadConfig');
      let fileTypes: Map<File, AllowedFileType>;

      try {
        const allowedTypes = Object.keys(uploadConfig) as AllowedFileType[];
        const allowedTypeSet = new Set(allowedTypes);
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
            if (!allowedTypeSet.has('blob')) {
              // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
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

            if (allowedTypeSet.has(matchedType)) {
              fileType = matchedType;
            } else if (allowedTypeSet.has('blob')) {
              fileType = 'blob';
            } else {
              // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
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

          if (checkCounts && typeFiles.length < minFileCount) {
            // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
            throw createUploadError(UploadErrorCode.TOO_LESS_FILES, {
              fileType,
              files: typeFiles,
              minFileCount,
            });
          }
          if (checkCounts && typeFiles.length > maxFileCount) {
            // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
            throw createUploadError(UploadErrorCode.TOO_MANY_FILES, {
              fileType,
              files: typeFiles,
              maxFileCount,
            });
          }
          if (!maxFileSize) continue;

          const match = fileSizePattern.exec(maxFileSize);

          if (!match) {
            // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
            throw createUploadError(UploadErrorCode.INVALID_FILE_SIZE, {
              files: typeFiles,
            });
          }

          const bytes =
            Number.parseFloat(match[1]) *
            1024 ** ['B', 'KB', 'MB', 'GB'].indexOf(match[3].toUpperCase());

          for (const file of typeFiles) {
            if (file.size > Math.floor(bytes)) {
              // oxlint-disable-next-line typescript/only-throw-error -- The public upload contract exposes typed data errors whose object identity must reach onError unchanged.
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

        return { error, fileTypes: null } as const;
      }

      return { error: null, fileTypes } as const;
    };
    const upload = (key: NodeKey, file: File) => {
      const entry = editor.read.nodes.get(key);
      if (
        !entry ||
        !NodeApi.isElement(entry[0]) ||
        typeof entry[0].mediaType !== 'string' ||
        !currentEntry(key, entry[0].mediaType)
      ) {
        return;
      }
      const { mediaType } = entry[0];
      const mediaDescriptor = resolvePlaceholderMediaPlugin(mediaType);

      if (!mediaDescriptor) return;
      const media = editor.plugin(mediaDescriptor);
      const mediaName = media.name;
      if (
        !media.installed ||
        (mediaName !== PLUGINS.audio &&
          mediaName !== PLUGINS.file &&
          mediaName !== PLUGINS.image &&
          mediaName !== PLUGINS.video)
      ) {
        return;
      }
      const validation = validateFiles([file], false);

      store.set({ error: validation.error });
      const fileType = validation.fileTypes?.get(file);
      if (!fileType) return;
      if (store.get('uploadConfig')[fileType]?.mediaType !== mediaName) {
        store.set({
          error: createUploadError(UploadErrorCode.INVALID_FILE_TYPE, {
            allowedTypes: Object.entries(store.get('uploadConfig'))
              .filter(([, config]) => config.mediaType === mediaName)
              .map(([allowedType]) => allowedType),
            files: [file],
          }),
        });
        return;
      }
      tasks.get(key)?.controller.abort();
      const controller = new AbortController();
      const task = { controller, mediaType };
      tasks.set(key, task);
      const progressStore = createZustandStore<MediaUploadState>(
        Object.freeze({ error: null, progress: 0, status: 'uploading' })
      );
      const resource: MediaUpload = {
        file,
        getSnapshot: progressStore.get,
        subscribe: progressStore.subscribe,
      };
      store.set({ uploads: { ...store.get('uploads'), [key]: resource } });
      const owns = () =>
        tasks.get(key) === task &&
        !controller.signal.aborted &&
        !!currentEntry(key, mediaType);
      const transport = store.get().upload;
      void (async () => {
        try {
          if (!transport) {
            throw new Error('No media upload transport is configured.');
          }
          const result = await transport(file, {
            signal: controller.signal,
            onProgress: (progress) => {
              if (!owns() || !Number.isFinite(progress)) return;
              const value = Math.max(0, Math.min(100, progress));
              if (progressStore.get('progress') !== value) {
                progressStore.set(
                  'state',
                  Object.freeze({
                    error: null,
                    progress: value,
                    status: 'uploading',
                  })
                );
              }
            },
          });
          if (!owns()) {
            if (tasks.get(key) === task) cancelUpload(key);
            return;
          }
          if (!result.url) throw new Error('The media upload returned no URL.');
          const current = currentEntry(key, mediaType);
          if (!current) return;
          update({ history: 'skip' }).replaceMedia(
            {
              ...result,
              ...(media.name === PLUGINS.file
                ? { name: result.name ?? file.name }
                : {}),
              plugin: mediaName,
              ...(media.name === PLUGINS.video ? { provider: 'file' } : {}),
            },
            { at: current[1] }
          );
          cancelUpload(key);
        } catch (error) {
          if (!owns()) {
            if (tasks.get(key) === task) cancelUpload(key);
            return;
          }
          controller.abort();
          progressStore.set(
            'state',
            Object.freeze({
              error,
              progress: progressStore.get('progress'),
              status: 'error',
            })
          );
        }
      })();
    };
    return {
      api: () => ({ cancelUpload, upload }),
      update: ({ context: { afterCommit }, tx }) => ({
        insertMedia: (
          files: File[] | FileList,
          options?: InsertMediaOptions
        ) => {
          const uploadConfig = store.get('uploadConfig');
          const validation = validateFiles(files, true);
          const acceptError = (error: UploadError) => {
            tx.effects.emit(placeholderValidationEffect, null);
            afterCommit(() => store.set({ error }));

            return true;
          };

          if (validation.error) return acceptError(validation.error);
          const { fileTypes } = validation;

          if (!store.get('multiple') && files.length > 1) {
            return acceptError(
              createUploadError(UploadErrorCode.TOO_MANY_FILES, {
                fileType: null,
                files: Array.from(files),
                maxFileCount: 1,
              })
            );
          }

          const maxFileCount = store.get('maxFileCount') ?? 3;

          if (files.length > maxFileCount) {
            return acceptError(
              createUploadError(UploadErrorCode.TOO_MANY_FILES, {
                fileType: null,
                files: Array.from(files),
                maxFileCount,
              })
            );
          }

          const { at: _at, ...restOptions } = options ?? {};

          if (store.get('disableEmptyPlaceholder')) {
            tx.tags.add('history-push');
          }

          const uploads = Array.from(files).flatMap((file) => {
            const fileType = fileTypes.get(file);
            const mediaType = fileType
              ? uploadConfig[fileType]?.mediaType
              : undefined;

            if (!mediaType) return [];

            const element = tx.schema.create(type, { mediaType });

            return [{ element, file }];
          });

          if (uploads.length === 0) return false;

          const elements = uploads.map(({ element }) => element);

          if (options?.at === undefined || options?.after !== undefined) {
            tx.blocks.insertAfter(elements, {
              ...restOptions,
              at: options?.after,
            });
          } else {
            tx.nodes.insert(elements, { ...restOptions, at: options.at });
          }

          const insertedUploads: Array<[NodeKey, File]> = uploads.map(
            ({ element, file }) => [tx.key(element), file]
          );

          afterCommit(() => {
            store.set({ error: null });
            for (const [key, file] of insertedUploads) upload(key, file);
          });

          return true;
        },
      }),
      activate({ onCleanup }) {
        onCleanup(() => {
          const active = [...tasks.values()];
          tasks.clear();
          active.forEach(({ controller }) => controller.abort());
          store.set({ uploads: {} });
        });
      },
      on: {
        commit({ commit }) {
          if (commit.changed.hasAny('document')) {
            for (const [key, task] of tasks) {
              if (!currentEntry(key, task.mediaType)) cancelUpload(key);
            }
          }
        },
      },
    };
  })
  .extend(() => ({
    commands: ({ around }) => [
      around(domCommands.insertData, ({ input, next, state }) => {
        const files = Array.from(input.files ?? []);

        if (
          files.length === 0 ||
          Array.from(input.types ?? []).includes('text/html')
        ) {
          return next();
        }

        const block = state.nodes.block();
        let handled = false;
        const transaction = state.transaction((tx) => {
          if (block && NodeApi.string(block[0]).length === 0) {
            tx.nodes.remove({ at: block[1] });
            handled = tx.placeholder.insertMedia(files, { at: block[1] });
          } else {
            handled = tx.placeholder.insertMedia(files, {
              at: block ? PathApi.next(block[1]) : undefined,
            });
          }
        });

        return handled ? transaction : next();
      }),
    ],
  }));

export type PlaceholderElement = ElementOf<typeof BasePlaceholderPlugin>;
