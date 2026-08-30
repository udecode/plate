import {
  type BaseMediaEmbedPlugin,
  parseMediaUrl,
  parseTwitterUrl,
  parseVideoUrl,
} from 'platejs/media';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { CaptionStatic, getMediaTextAlign } from './caption-static';

export function MediaEmbedElementStatic(
  props: PliteElementProps<typeof BaseMediaEmbedPlugin>
) {
  const { url, width } = props.element;
  const textAlign = getMediaTextAlign(props.element);
  const embed = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  return (
    <PliteElement className="py-2.5" {...props}>
      <figure
        className="group relative m-0 inline-block max-w-full cursor-default"
        style={{ textAlign, width }}
      >
        {embed?.provider === 'twitter' ? (
          <a
            href={embed.sourceUrl ?? embed.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            View post
          </a>
        ) : embed?.url ? (
          <iframe
            className="aspect-video w-full rounded-sm border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            // oxlint-disable-next-line react/iframe-missing-sandbox -- [P0 behavior-boundary] External media providers need scripts and their own origin for playback; the remaining sandbox capabilities stay explicit.
            sandbox="allow-scripts allow-same-origin allow-presentation"
            src={embed.url}
            title="Embedded media"
            allowFullScreen
          />
        ) : null}
        <CaptionStatic align={textAlign} element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </PliteElement>
  );
}
