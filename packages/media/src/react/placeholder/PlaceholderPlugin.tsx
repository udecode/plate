import type { NodeInsertNodesOptions } from '@platejs/slate';
import {
  type ExtendConfig,
  type TPlaceholderElement,
  bindFirst,
  KEYS,
  NodeApi,
} from 'platejs';
import { toTPlatePlugin } from 'platejs/react';

import type { AllowedFileType } from './internal/mimes';
import type { MediaItemConfig, UploadError } from './type';

import { type PlaceholderConfig, BasePlaceholderPlugin } from '../../lib';
import { insertMedia } from './transforms/insertMedia';

export type PlaceholderApi = {
  addUploadingFile: (id: string, file: File) => void;
  getUploadingFile: (id: string) => File | undefined;
  removeUploadingFile: (id: string) => void;
};

type InsertNodesOptions = NonNullable<
  NodeInsertNodesOptions<TPlaceholderElement> & { nextBlock?: boolean }
>;

export type UploadConfig = Partial<Record<AllowedFileType, MediaItemConfig>>;

type PlaceholderPluginConfig = ExtendConfig<
  PlaceholderConfig,
  {
    disableEmptyPlaceholder: boolean;
    disableFileDrop: boolean;
    uploadConfig: UploadConfig;
    uploadingFiles: Record<string, File>;
    error?: UploadError | null;
    maxFileCount?: number;
    // Whether multiple files of the same type can be uploaded.
    multiple?: boolean;
  },
  { placeholder: PlaceholderApi },
  {},
  {
    insert: {
      media: (files: FileList, options?: InsertNodesOptions) => void;
    };
  }
>;

export const PlaceholderPlugin = toTPlatePlugin<PlaceholderPluginConfig>(
  BasePlaceholderPlugin,
  {
    options: {
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
    },
  }
)
  .extendTxGroup('insert', ({ editor }) => () => ({
    media: bindFirst(insertMedia, editor),
  }))
  .extendApi(({ getOption, setOption }) => ({
    addUploadingFile: (id: string, file: File) => {
      const uploadingFiles = getOption('uploadingFiles');

      setOption('uploadingFiles', {
        ...uploadingFiles,
        [id]: file,
      });
    },
    getUploadingFile: (id: string) => {
      const uploadingFiles = getOption('uploadingFiles');

      return uploadingFiles[id];
    },
    removeUploadingFile: (id: string) => {
      const uploadingFiles = getOption('uploadingFiles');

      delete uploadingFiles[id];

      setOption('uploadingFiles', uploadingFiles);
    },
  }))
  .extend(({ getOption }) => ({
    handlers: {
      onDrop: ({ editor, event }) => {
        // using DnD plugin by default
        if (!getOption('disableFileDrop')) return;

        const { files } = event.dataTransfer;

        if (files.length === 0) return false;

        /** Without this, the dropped file replaces the page */
        event.preventDefault();
        event.stopPropagation();

        /**
         * When we drop a file, the selection won't move automatically to the
         * drop location. Find the location from the event and upload the files
         * at that location.
         */
        const at = editor.api.findEventRange(event);

        if (!at) return false;

        editor.update<PlaceholderPluginConfig['tx']>((tx) =>
          tx.insert.media(files)
        );

        return true;
      },
      onPaste: ({ editor, event }) => {
        const { files, types } = event.clipboardData;
        const TEXT_HTML = 'text/html';

        // If there are files but no HTML, it must be a system file
        if (files.length > 0 && !types.includes(TEXT_HTML)) {
          event.preventDefault();
          event.stopPropagation();

          let inserted = false;
          const ancestor = editor.api.block({ highest: true });

          if (ancestor) {
            const [node, path] = ancestor;

            if (NodeApi.string(node).length === 0) {
              editor.update((tx) => {
                tx.nodes.remove({ at: path });
              });
              insertMedia(editor, files, { at: path, nextBlock: false });
              inserted = true;
            }
          }
          if (!inserted) {
            insertMedia(editor, files, { nextBlock: false });
          }

          return true;
        }

        return false;
      },
    },
  }));
