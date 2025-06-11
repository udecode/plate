import { KEYS } from '@udecode/plate';
import { BaseCaptionPlugin } from '@udecode/plate-caption';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from '@udecode/plate-media';

import { AudioElementStatic } from '@/registry/ui/media-audio-node-static';
import { FileElementStatic } from '@/registry/ui/media-file-node-static';
import { ImageElementStatic } from '@/registry/ui/media-image-node-static';
import { VideoElementStatic } from '@/registry/ui/media-video-node-static';

export const BaseMediaKit = [
  BaseImagePlugin.withComponent(ImageElementStatic),
  BaseVideoPlugin.withComponent(VideoElementStatic),
  BaseAudioPlugin.withComponent(AudioElementStatic),
  BaseFilePlugin.withComponent(FileElementStatic),
  BaseCaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
  BaseMediaEmbedPlugin,
  BasePlaceholderPlugin,
];
