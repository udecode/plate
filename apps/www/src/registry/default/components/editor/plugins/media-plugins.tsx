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

import { ImagePreview } from '@/registry/default/plate-ui/image-preview';
import { MediaFloatingToolbar } from '@/registry/default/plate-ui/media-floating-toolbar';
import { MediaUploadToast } from '@/registry/default/plate-ui/media-upload-toast';

export const mediaPlugins = [
  ImagePlugin.extend({
    options: {
      disableUploadInsert: true,
    },
    render: { afterEditable: ImagePreview },
  }),
  MediaEmbedPlugin.configure({
    render: { afterEditable: () => <MediaFloatingToolbar /> },
  }),
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin, MediaEmbedPlugin] },
  }),
  PlaceholderPlugin.configure({
    render: {
      afterEditable: () => <MediaUploadToast />,
    },
  }),
] as const;
