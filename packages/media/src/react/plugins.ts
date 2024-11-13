import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../lib';
import { BaseMediaFloatingPlugin } from '../lib/BaseMediaFloatingPlugin';

export const ImagePlugin = toPlatePlugin(BaseImagePlugin);

export const MediaEmbedPlugin = toPlatePlugin(BaseMediaEmbedPlugin);

export const AudioPlugin = toPlatePlugin(BaseAudioPlugin);

export const FilePlugin = toPlatePlugin(BaseFilePlugin);

export const VideoPlugin = toPlatePlugin(BaseVideoPlugin);

export const MediaFloatingPlugin = toPlatePlugin(BaseMediaFloatingPlugin);
