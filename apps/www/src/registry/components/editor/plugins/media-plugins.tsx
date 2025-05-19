'use client';

import { CaptionPlugin } from '@udecode/plate-caption/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { createPlatePlugins } from '@udecode/plate/react';

import { MediaPreviewDialog } from '@/registry/ui/media-preview-dialog';
import { MediaUploadToast } from '@/registry/ui/media-upload-toast';

export const MediaKit = createPlatePlugins([
  ImagePlugin.extend({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog },
  }),
  MediaEmbedPlugin,
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  CaptionPlugin.configure({
    options: {
      plugins: [
        ImagePlugin,
        VideoPlugin,
        AudioPlugin,
        FilePlugin,
        MediaEmbedPlugin,
      ],
    },
  }),
  PlaceholderPlugin.configure({
    options: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast },
  }),
]);
