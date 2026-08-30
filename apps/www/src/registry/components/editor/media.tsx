'use client';

import {
  PlaceholderPlugin,
  UploadErrorCode,
  AudioPlugin,
  FilePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from 'platejs/media/react';
import { usePluginStore } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { AudioElement } from '@/registry/components/editor/media-audio';
import { MediaEmbedElement } from '@/registry/components/editor/media-embed';
import { FileElement } from '@/registry/components/editor/media-file';
import { ImageElement } from '@/registry/components/editor/media-image';
import { PlaceholderElement } from '@/registry/components/editor/media-placeholder';
import {
  imagePlugin,
  MediaPreviewDialog,
} from '@/registry/components/editor/media-preview-dialog';
import { VideoElement } from '@/registry/components/editor/media-video';

export function MediaUploadToast() {
  const uploadError = usePluginStore(PlaceholderPlugin, 'error');

  React.useEffect(() => {
    if (!uploadError) return;

    const { code, data } = uploadError;

    switch (code) {
      case UploadErrorCode.INVALID_FILE_SIZE: {
        toast.error(
          `The size of files ${data.files
            .map((f) => f.name)
            .join(', ')} is invalid`
        );

        break;
      }
      case UploadErrorCode.INVALID_FILE_TYPE: {
        toast.error(
          `The type of files ${data.files
            .map((f) => f.name)
            .join(', ')} is invalid`
        );

        break;
      }
      case UploadErrorCode.TOO_LARGE: {
        toast.error(
          `The size of files ${data.files
            .map((f) => f.name)
            .join(', ')} is too large than ${data.maxFileSize}`
        );

        break;
      }
      case UploadErrorCode.TOO_LESS_FILES: {
        toast.error(
          `The mini um number of files is ${data.minFileCount} for ${data.fileType}`
        );

        break;
      }
      case UploadErrorCode.TOO_MANY_FILES: {
        toast.error(
          `The maximum number of files is ${data.maxFileCount} ${
            data.fileType ? `for ${data.fileType}` : ''
          }`
        );

        break;
      }
    }
  }, [uploadError]);

  return null;
}

export const MediaKit = [
  imagePlugin.configure({
    component: ImageElement,
    initialState: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog },
  }),
  MediaEmbedPlugin.configure({ component: MediaEmbedElement }),
  VideoPlugin.configure({ component: VideoElement }),
  AudioPlugin.configure({ component: AudioElement }),
  FilePlugin.configure({ component: FileElement }),
  PlaceholderPlugin.configure({
    component: PlaceholderElement,
    initialState: {
      disableEmptyPlaceholder: true,
      maxFileCount: 5,
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
    },
    render: { afterEditable: MediaUploadToast },
  }),
];
