import { toPlatePlugin } from '@platejs/core/react';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../lib';

export const ImagePlugin = toPlatePlugin(BaseImagePlugin);
export const MediaEmbedPlugin = toPlatePlugin(BaseMediaEmbedPlugin);
export const AudioPlugin = toPlatePlugin(BaseAudioPlugin);
export const FilePlugin = toPlatePlugin(BaseFilePlugin);
export const VideoPlugin = toPlatePlugin(BaseVideoPlugin);

/** Exact React media descriptors accepted by shared media controls. */
export type MediaPlugin =
  | typeof AudioPlugin
  | typeof FilePlugin
  | typeof ImagePlugin
  | typeof MediaEmbedPlugin
  | typeof VideoPlugin;
