import { type ExtendConfig, bindFirst } from '@udecode/plate-common';
import { findEventRange, toTPlatePlugin } from '@udecode/plate-common/react';

import type { AllowedFileType } from './internal/mimes';
import type { Error, MediaItemConfig } from './type';

import { type PlaceholderConfig, BasePlaceholderPlugin } from '../../lib';
import { AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin } from '../plugins';
import { insertMedia } from './transforms/insertMedia';

export type PlaceholderApi = {
  addUploadingFile: (id: string, file: File) => void;
  getUploadingFile: (id: string) => File | undefined;
  removeUploadingFile: (id: string) => void;
};

export type PlaceholderTransforms = {
  insertMedia: (files: FileList) => void;
};

export type UploadConfig = Partial<Record<AllowedFileType, MediaItemConfig>>;

export const PlaceholderPlugin = toTPlatePlugin<
  ExtendConfig<
    PlaceholderConfig,
    {
      disabledDndPlugin: boolean;
      uploadConfig: UploadConfig;
      uploadingFiles: Record<string, File>;
      error?: Error | null;
      maxFileCount?: number;
      // Whether multiple files of the same type can be uploaded.
      multiple?: boolean;
    },
    { placeholder: PlaceholderApi }
  >
>(BasePlaceholderPlugin, {
  options: {
    disabledDndPlugin: false,
    error: null,
    maxFileCount: 5,
    multiple: true,
    uploadConfig: {
      audio: {
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: AudioPlugin.key,
        minFileCount: 1,
      },
      blob: {
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      image: {
        maxFileCount: 3,
        maxFileSize: '4MB',
        mediaType: ImagePlugin.key,
        minFileCount: 1,
      },
      pdf: {
        maxFileCount: 1,
        maxFileSize: '4MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      text: {
        maxFileCount: 1,
        maxFileSize: '64KB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      video: {
        maxFileCount: 1,
        maxFileSize: '16MB',
        mediaType: VideoPlugin.key,
        minFileCount: 1,
      },
    },
    uploadingFiles: {},
  },
})
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
        if (!getOption('disabledDndPlugin')) return;

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
        const at = findEventRange(editor, event);

        if (!at) return false;

        tf.insert.media(files);

        return true;
      },
      onPaste: ({ event, tf }) => {
        const { files } = event.clipboardData;

        if (files.length === 0) return false;

        event.preventDefault();
        event.stopPropagation();

        tf.insert.media(files);

        return true;
      },
    },
  }));
