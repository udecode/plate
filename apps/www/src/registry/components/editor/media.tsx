import {
  AudioPlugin,
  FilePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from 'platejs/media/react';

import { AudioElement } from '@/registry/components/editor/media-audio';
import { MediaEmbedElement } from '@/registry/components/editor/media-embed';
import { FileElement } from '@/registry/components/editor/media-file';
import { ImageElement } from '@/registry/components/editor/media-image';
import {
  imagePlugin,
  MediaPreviewDialog,
} from '@/registry/components/editor/media-preview-dialog';
import { VideoElement } from '@/registry/components/editor/media-video';

export const MediaKit = [
  imagePlugin.configure({
    component: ImageElement,
    slots: { afterEditable: MediaPreviewDialog },
  }),
  MediaEmbedPlugin.configure({ component: MediaEmbedElement }),
  VideoPlugin.configure({ component: VideoElement }),
  AudioPlugin.configure({ component: AudioElement }),
  FilePlugin.configure({ component: FileElement }),
];
