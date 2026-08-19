import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from '@platejs/media';
import { AudioElementStatic } from '@/registry/components/editor/media-audio-static';
import { MediaEmbedElementStatic } from '@/registry/components/editor/media-embed-static';
import { FileElementStatic } from '@/registry/components/editor/media-file-static';
import { ImageElementStatic } from '@/registry/components/editor/media-image-static';
import { VideoElementStatic } from '@/registry/components/editor/media-video-static';

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
