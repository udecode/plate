import type { PlaceholderConfig } from '@udecode/plate-media';

import { type ExtendConfig, bindFirst } from '@udecode/plate-common';
import { findEventRange, toTPlatePlugin } from '@udecode/plate-common/react';

import { BasePlaceholderPlugin } from '../../lib';
import { AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin } from '../plugins';
import { insertMedias } from './transforms/insertMedias';

export type MediaType =
  | typeof AudioPlugin.key
  | typeof FilePlugin.key
  | typeof ImagePlugin.key
  | typeof VideoPlugin.key;

export type MediaItemConfig = {
  // extensions that are accepted for this media type
  accept?: string[];
  // The maximum number of files of this type that can be uploaded.
  maxFileCount?: number;
  // The maximum file size for a file of this type. FileSize is a string that can be parsed as a number followed by a unit of measurement (B, KB, MB, or GB)
  maxFileSize?: string;
  // The minimum number of files of this type that must be uploaded.
  minFileCount?: number;
};

export type PlaceholderApi = {
  addUploadingFile: (id: string, file: File) => void;
  getUploadingFile: (id: string) => File | undefined;
  removeUploadingFile: (id: string) => void;
};

export type PlaceholderTransforms = {
  insertMedias: (files: FileList) => void;
};

export type MediaConfig = Partial<Record<MediaType, MediaItemConfig>>;

export const PlaceholderPlugin = toTPlatePlugin<
  ExtendConfig<
    PlaceholderConfig,
    {
      mediaConfig: MediaConfig;
      uploadingFiles: Record<string, File>;
      // Whether multiple files of the same type can be uploaded.
      multiple?: boolean;
      uploadErrorMessage?: string | null;
      uploadMaxFileCount?: number;
    },
    { placeholder: PlaceholderApi },
    { placeholder: PlaceholderTransforms }
  >
>(BasePlaceholderPlugin, {
  options: {
    mediaConfig: {
      [AudioPlugin.key]: {
        accept: ['mp3'],
        maxFileCount: 1,
        maxFileSize: '8MB',
        minFileCount: 1,
      },
      [FilePlugin.key]: {
        accept: [],
        maxFileCount: 1,
        maxFileSize: '8MB',
        minFileCount: 1,
      },
      [ImagePlugin.key]: {
        accept: ['.png', '.jpg', '.jpeg'],
        maxFileCount: 3,
        maxFileSize: '8MB',
        minFileCount: 1,
      },
      [VideoPlugin.key]: {
        accept: ['.mp4'],
        maxFileCount: 1,
        maxFileSize: '8MB',
        minFileCount: 1,
      },
    },
    multiple: true,
    uploadErrorMessage: null,
    uploadMaxFileCount: 3,
    uploadingFiles: {},
  },
})
  .extendTransforms<PlaceholderTransforms>(({ editor }) => ({
    insertMedias: bindFirst(insertMedias, editor),
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

        tf.placeholder.insertMedias(files);

        return true;
      },
      onPaste: ({ event, tf }) => {
        const { files } = event.clipboardData;

        if (files.length === 0) return false;

        event.preventDefault();
        event.stopPropagation();

        tf.placeholder.insertMedias(files);

        return true;
      },
    },
  }));
