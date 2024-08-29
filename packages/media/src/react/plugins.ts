import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  AudioPlugin as BaseAudioPlugin,
  FilePlugin as BaseFilePlugin,
  ImagePlugin as BaseImagePlugin,
  MediaEmbedPlugin as BaseMediaEmbedPlugin,
  VideoPlugin as BaseVideoPlugin,
} from '../lib';

export const ImagePlugin = toPlatePlugin(BaseImagePlugin);

export const MediaEmbedPlugin = toPlatePlugin(BaseMediaEmbedPlugin);

export const AudioPlugin = toPlatePlugin(BaseAudioPlugin);

export const FilePlugin = toPlatePlugin(BaseFilePlugin);

export const VideoPlugin = toPlatePlugin(BaseVideoPlugin);
