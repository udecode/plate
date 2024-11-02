import type { PlaceholderConfig } from '@udecode/plate-media';

import { type ExtendConfig, bindFirst } from '@udecode/plate-common';
import { findEventRange, toTPlatePlugin } from '@udecode/plate-common/react';

import { BasePlaceholderPlugin } from '../../lib';
import { AudioPlugin, FilePlugin, ImagePlugin, VideoPlugin } from '../plugins';
import { insertMedia } from './transforms/insertMedia';

export type MediaType = 'audio' | 'file' | 'image' | 'video';

export type MediaItemConfig = {
  // The type of media that this config is for.
  mediaType:
    | typeof AudioPlugin.key
    | typeof FilePlugin.key
    | typeof ImagePlugin.key
    | typeof VideoPlugin.key;
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
  insertMedia: (files: FileList) => void;
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
      audio: {
        accept: ['.mp3'],
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: AudioPlugin.key,
        minFileCount: 1,
      },
      file: {
        accept: ['.pdf', '.txt', '.doc', '.docx'],
        maxFileCount: 1,
        maxFileSize: '8MB',
        mediaType: FilePlugin.key,
        minFileCount: 1,
      },
      image: {
        accept: ['.png', '.jpg', '.jpeg'],
        maxFileCount: 4,
        maxFileSize: '2MB',
        mediaType: ImagePlugin.key,
        minFileCount: 1,
      },
      video: {
        accept: ['.mp4'],
        maxFileCount: 1,
        maxFileSize: '256MB',
        mediaType: VideoPlugin.key,
        minFileCount: 1,
      },
    },
    multiple: true,
    uploadErrorMessage: null,
    uploadMaxFileCount: 5,
    uploadingFiles: {},
  },
})
  .extendTransforms<PlaceholderTransforms>(({ editor }) => ({
    insertMedia: bindFirst(insertMedia, editor),
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

        tf.placeholder.insertMedia(files);

        return true;
      },
      onPaste: ({ event, tf }) => {
        const { files } = event.clipboardData;

        if (files.length === 0) return false;

        event.preventDefault();
        event.stopPropagation();

        tf.placeholder.insertMedia(files);

        return true;
      },
    },
  }));
