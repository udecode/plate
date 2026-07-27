'use client';

import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@platejs/media/react';
import { AudioElement } from '@/registry/ui/media-audio-node';
import { MediaEmbedElement } from '@/registry/ui/media-embed-node';
import { FileElement } from '@/registry/ui/media-file-node';
import { ImageElement } from '@/registry/ui/media-image-node';
import { PlaceholderElement } from '@/registry/ui/media-placeholder-node';
import { MediaPreviewDialog } from '@/registry/ui/media-preview-dialog';
import { MediaUploadToast } from '@/registry/ui/media-upload-toast';
import { VideoElement } from '@/registry/ui/media-video-node';

export const MediaKit = [
  ImagePlugin.configure({
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
    initialState: { disableEmptyPlaceholder: true },
    render: { afterEditable: MediaUploadToast },
  }),
];
