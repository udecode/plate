import type { BaseEditor } from '@platejs/core';
import { useEditor } from '@platejs/core/react';
import { type NodeInsertNodesOptions, PathApi } from '@platejs/plite';
import type { TImageElement, TMediaEmbedElement } from '@platejs/utils';
import { KEYS, NODES } from '@platejs/utils';

import { BaseImagePlugin } from '../../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../../lib/media-embed/BaseMediaEmbedPlugin';
import type { MediaInsertInput } from '../../lib/BaseMediaPlugin';

export interface InsertMediaUrlOptions
  extends NodeInsertNodesOptions<TImageElement | TMediaEmbedElement> {
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
  const image = editor.plugin(KEYS.img);
  const imageType = image.installed ? image.type : NODES.img;
  const type = requestedType ?? imageType;
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
      : // biome-ignore lint/suspicious/noAlert: intentional user input for media URL
        window.prompt(
          `Enter the URL of the ${type === imageType ? NODES.img : NODES.mediaEmbed}`
        );

    if (!url) return;

    const resolvedAt = atAnchor?.resolve();
    const blockPath = block ? editor.read.nodes.path(block) : undefined;

    if ((atAnchor && !resolvedAt) || (block && !blockPath)) return;

    const insertOptions = {
      ...options,
      at: resolvedAt ?? (blockPath ? PathApi.next(blockPath) : undefined),
    };

    if (type === imageType) {
      editor
        .plugin(BaseImagePlugin)
        .update.insert({ caption, url }, insertOptions);
    } else {
      editor
        .plugin(BaseMediaEmbedPlugin)
        .update.insert({ caption, url }, insertOptions);
    }
  } finally {
    atAnchor?.release();
  }
};

export const useMediaToolbarButton = ({
  nodeType,
}: {
  nodeType?: string;
} = {}) => {
  const editor = useEditor();

  return {
    props: {
      onClick: async () => {
        await insertMediaUrl(editor, { type: nodeType });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
