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

import { AudioElement } from '@/registry/ui/media-audio-node';
import { MediaEmbedElement } from '@/registry/ui/media-embed-node';
import { FileElement } from '@/registry/ui/media-file-node';
import { ImageElement } from '@/registry/ui/media-image-node';
import { PlaceholderElement } from '@/registry/ui/media-placeholder-node';
import { MediaPreviewDialog } from '@/registry/ui/media-preview-dialog';
import { MediaUploadToast } from '@/registry/ui/media-upload-toast';
import { VideoElement } from '@/registry/ui/media-video-node';

export const MediaKit = [
  ImagePlugin.extend({
    options: { disableUploadInsert: true },
    render: { afterEditable: MediaPreviewDialog },
  }).withComponent(ImageElement),
  MediaEmbedPlugin.withComponent(MediaEmbedElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
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
  }).withComponent(PlaceholderElement),
];
