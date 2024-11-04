import { type ExtendConfig, bindFirst } from '@udecode/plate-common';
import { findEventRange, toTPlatePlugin } from '@udecode/plate-common/react';

import type { AllowedFileType } from './internal/mimes';
import type { MediaItemConfig, UploadErrorCode } from './type';

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

export type UploadError = {
  code: UploadErrorCode;
  data: { invalidateFiles: File[] };
};

export type uploadConfig = Partial<Record<AllowedFileType, MediaItemConfig>>;

export const PlaceholderPlugin = toTPlatePlugin<
  ExtendConfig<
    PlaceholderConfig,
    {
      uploadConfig: uploadConfig;
      uploadingFiles: Record<string, File>;
      // Whether multiple files of the same type can be uploaded.
      multiple?: boolean;
      uploadCode?: string | null;
      uploadError?: UploadError;
      uploadMaxFileCount?: number;
    },
    { placeholder: PlaceholderApi }
  >
>(BasePlaceholderPlugin, {
  options: {
    multiple: true,
    uploadCode: null,
    uploadConfig: {
      audio: {
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: AudioPlugin.key,
        minFileCount: 1,
      },
      blob: {
        maxFileCount: 1,
        maxFileSize: '256MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      image: {
        maxFileCount: 1,
        maxFileSize: '2MB',
        mediaType: ImagePlugin.key,
        minFileCount: 1,
      },
      pdf: {
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      text: {
        maxFileCount: 1,
        maxFileSize: '256MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      video: {
        maxFileCount: 1,
        maxFileSize: '256MB',
        mediaType: VideoPlugin.key,
        minFileCount: 1,
      },
    },
    uploadMaxFileCount: 5,
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
    // getMediaConfig: (mediaType: MediaKeys) => {
    //   const config = getOption('mediaConfig');

    //   const keys = Object.keys(config);

    //   for (const key of keys) {
    //     const item = config[key as AllowedFileType];

    //     if (item?.mediaType === mediaType) {
    //       return item;
    //     }
    //   }

    //   return null;
    // },
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
  .extend(() => ({
    handlers: {
      onDrop: ({ editor, event, tf }) => {
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
