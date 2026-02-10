import {
  type ExtendConfig,
  type InsertNodesOptions,
  bindFirst,
  KEYS,
  NodeApi,
} from 'platejs';
import { toTPlatePlugin } from 'platejs/react';

import type { AllowedFileType } from './internal/mimes';
import type { MediaItemConfig, UploadError } from './type';

import { type PlaceholderConfig, BasePlaceholderPlugin } from '../../lib';
import { insertMedia } from './transforms/insertMedia';
import { isHistoryMarking } from './utils/history';

export type PlaceholderApi = {
  addUploadingFile: (id: string, file: File) => void;
  getUploadingFile: (id: string) => File | undefined;
  removeUploadingFile: (id: string) => void;
};

export type PlaceholderTransforms = {
  insertMedia: (files: FileList, options?: InsertNodesOptions) => void;
};

export type UploadConfig = Partial<Record<AllowedFileType, MediaItemConfig>>;

export const PlaceholderPlugin = toTPlatePlugin<
  ExtendConfig<
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
    { placeholder: PlaceholderApi }
  >
>(BasePlaceholderPlugin, {
  normalizeInitialValue: ({ editor, getOptions, type }) => {
    if (!getOptions().disableEmptyPlaceholder) return;

    const placeholders = editor.api.nodes({
      at: [],
      match: { type },
    });

    for (const [, path] of placeholders) {
      editor.tf.removeNodes({ at: path });
    }
  },
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
})
  .overrideEditor(({ editor, tf: { writeHistory } }) => ({
    transforms: {
      writeHistory(stack, batch) {
        if (isHistoryMarking(editor)) {
          const newBatch = {
            ...batch,
            [KEYS.placeholder]: true,
          };

          writeHistory(stack, newBatch);

          return;
        }

        return writeHistory(stack, batch);
      },
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    insert: {
      media: bindFirst(insertMedia, editor),
    },
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
      onDrop: ({ editor, event, tf }) => {
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

        tf.insert.media(files);

        return true;
      },
      onPaste: ({ editor, event, tf }) => {
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
              editor.tf.removeNodes({ at: path });
              tf.insert.media(files, { at: path, nextBlock: false });
              inserted = true;
            }
          }
          if (!inserted) {
            tf.insert.media(files, { nextBlock: false });
          }

          return true;
        }

        return false;
      },
    },
  }));
