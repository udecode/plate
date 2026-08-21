import type { BaseEditor, PlateNodeInsertOptions } from '@platejs/core';
import { PathApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import type { MediaInsertInput } from '../../lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../../lib/media-embed/BaseMediaEmbedPlugin';

export interface InsertMediaUrlOptions extends PlateNodeInsertOptions {
  /** Resolve a URL without showing the default browser prompt. */
  getUrl?: () => Promise<string>;
  /** Initial caption content compiled into the media element's children. */
  caption?: MediaInsertInput['caption'];
  type?: string;
}

export const insertMediaUrl = async (
  editor: BaseEditor,
  {
    at,
    caption,
    getUrl,
    type: requestedType,
    ...options
  }: InsertMediaUrlOptions = {}
) => {
  const image = editor.plugin(BaseImagePlugin);
  const mediaEmbed = editor.plugin(BaseMediaEmbedPlugin);
  const type =
    requestedType ??
    (image.installed
      ? image.schema.type
      : mediaEmbed.installed
        ? mediaEmbed.schema.type
        : undefined);

  if (!type) return;

  const isImage = image.installed && type === image.schema.type;
  const isMediaEmbed = mediaEmbed.installed && type === mediaEmbed.schema.type;

  if (!isImage && !isMediaEmbed) return;

  const atAnchor =
    at === undefined
      ? undefined
      : editor.anchor(at, {
          association: 'forward',
          deletion: 'nearest',
        });
  const block = at === undefined ? editor.read.nodes.block()?.[0] : undefined;

  try {
    const url = getUrl
      ? await getUrl()
      : // intentional user input for media URL
        window.prompt(
          `Enter the URL of the ${isImage ? PLUGINS.image : PLUGINS.mediaEmbed}`
        );

    if (!url) return;

    const resolvedAt = atAnchor?.resolve();
    const blockPath = block ? editor.read.nodes.path(block) : undefined;

    if ((atAnchor && !resolvedAt) || (block && !blockPath)) return;

    const insertOptions = {
      ...options,
      at: resolvedAt ?? (blockPath ? PathApi.next(blockPath) : undefined),
    };

    if (isImage) {
      image.update.insert({ caption, url }, insertOptions);
    } else if (isMediaEmbed) {
      mediaEmbed.update.insert({ caption, url }, insertOptions);
    }
  } finally {
    atAnchor?.release();
  }
};
