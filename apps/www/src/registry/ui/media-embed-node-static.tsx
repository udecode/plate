import * as React from 'react';

import type { TMediaEmbedElement, TResizableProps } from 'platejs';
import type { PliteElementProps } from 'platejs/static';

import { parseMediaUrl, parseTwitterUrl, parseVideoUrl } from '@platejs/media';
import { PliteElement } from 'platejs/static';

import { CaptionStatic } from './caption-static';

export function MediaEmbedElementStatic(
  props: PliteElementProps<TMediaEmbedElement & TResizableProps>
) {
  const { align = 'center', url, width } = props.element;
  const embed = parseMediaUrl(url, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  return (
    <PliteElement className="py-2.5" {...props}>
      <figure
        className="group relative m-0 inline-block max-w-full cursor-default"
        style={{ textAlign: align, width }}
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
            src={embed.url}
            title="Embedded media"
            allowFullScreen
          />
        ) : null}
        <CaptionStatic align={align} element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </PliteElement>
  );
}
