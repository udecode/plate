import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from '@platejs/media';
import { AudioElementStatic } from '@/registry/ui/media-audio-node-static';
import { MediaEmbedElementStatic } from '@/registry/ui/media-embed-node-static';
import { FileElementStatic } from '@/registry/ui/media-file-node-static';
import { ImageElementStatic } from '@/registry/ui/media-image-node-static';
import { VideoElementStatic } from '@/registry/ui/media-video-node-static';

export const BaseMediaKit = [
  BaseImagePlugin.configure({ component: ImageElementStatic }),
  BaseVideoPlugin.configure({ component: VideoElementStatic }),
  BaseAudioPlugin.configure({ component: AudioElementStatic }),
  BaseFilePlugin.configure({ component: FileElementStatic }),
  BaseMediaEmbedPlugin.configure({
    component: MediaEmbedElementStatic,
  }),
  BasePlaceholderPlugin,
];
