import { createBasePlugin } from '@platejs/core';

import { BaseAudioPlugin } from '../lib/BaseAudioPlugin';
import { BaseFilePlugin } from '../lib/BaseFilePlugin';
import { BaseVideoPlugin } from '../lib/BaseVideoPlugin';
import { BaseImagePlugin } from '../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../lib/media-embed/BaseMediaEmbedPlugin';
import { migrateMediaV54Document } from './MediaV54Migration.internal';

/**
 * Converts pre-v54 media `caption` properties into direct child content before
 * schema fitting.
 */
export const MediaV54MigrationPlugin = createBasePlugin({
  key: 'mediaV54Migration',
  transformInitialValue: ({ editor, value }) => {
    const types = new Set<string>();
    const audio = editor.plugin(BaseAudioPlugin);
    const file = editor.plugin(BaseFilePlugin);
    const image = editor.plugin(BaseImagePlugin);
    const mediaEmbed = editor.plugin(BaseMediaEmbedPlugin);
    const video = editor.plugin(BaseVideoPlugin);

    if (audio.installed) types.add(audio.type);
    if (file.installed) types.add(file.type);
    if (image.installed) types.add(image.type);
    if (mediaEmbed.installed) types.add(mediaEmbed.type);
    if (video.installed) types.add(video.type);

    return migrateMediaV54Document(value, {
      isInline: editor.read.schema.isInline,
      types,
    });
  },
});
