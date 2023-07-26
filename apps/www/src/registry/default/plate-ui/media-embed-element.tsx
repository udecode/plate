import React from 'react';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import {
  ELEMENT_MEDIA_EMBED,
  parseTwitterUrl,
  parseVideoUrl,
  TMediaEmbedElement,
  useMediaState,
} from '@udecode/plate-media';
import { cva } from 'class-variance-authority';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import { Tweet } from 'react-tweet';

import { cn } from '@/lib/utils';

import { Caption, CaptionTextarea } from './caption';
import { MediaPopover } from './media-popover';
import { Resizable, ResizeHandle } from './resizable';

const MediaEmbedElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TMediaEmbedElement>
>(({ className, children, ...props }, ref) => {
  const { align, focused, readOnly, selected, embed, isTweet, isVideo, isYoutube } =
    useMediaState({
      urlParsers: [parseTwitterUrl, parseVideoUrl],
    });
  const provider = embed?.provider;

  return (
    <MediaPopover pluginKey={ELEMENT_MEDIA_EMBED}>
      <PlateElement
        ref={ref}
        className={cn('relative py-2.5', className)}
        {...props}
      >
        <figure className="group relative m-0 w-full" contentEditable={false}>
          <Resizable
            align={align}
            options={{
              maxWidth: isTweet ? 550 : '100%',
              minWidth: isTweet ? 300 : 100,
            }}
          >
            <ResizeHandle options={{ direction: 'left' }} />
            
            {isYoutube && <LiteYouTubeEmbed id={embed!.id!} title="youtube" />}
            {isVideo && !isYoutube && (

            {isVideo && (
              <div
                className={cn(
                  provider === 'youtube' && 'pb-[56.2061%]',
                  provider === 'vimeo' && 'pb-[75%]',
                  provider === 'youku' && 'pb-[56.25%]',
                  provider === 'dailymotion' && 'pb-[56.0417%]',
                  provider === 'coub' && 'pb-[51.25%]'
                )}
              >
                <iframe
                  className={cn(
                    'absolute left-0 top-0 h-full w-full rounded-sm',
                    isVideo && 'border-0',
                    focused && selected && 'ring-2 ring-ring ring-offset-2'
                  )}
                  src={embed!.url}
                  title="embed"
                  allowFullScreen
                />
              </div>
            )}
            {isTweet && (
              <div
                className={cn(
                  '[&_.react-tweet-theme]:my-0',
                  !readOnly &&
                    selected &&
                    '[&_.react-tweet-theme]:ring-2 [&_.react-tweet-theme]:ring-ring [&_.react-tweet-theme]:ring-offset-2'
                )}
              >
                <Tweet id={embed!.id!} />
              </div>
            )}

            <ResizeHandle options={{ direction: 'right' }} />
          </Resizable>

          <Caption align={align}>
            <CaptionTextarea placeholder="Write a caption..." />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    </MediaPopover>
  );
});
MediaEmbedElement.displayName = 'MediaEmbedElement';

export { MediaEmbedElement };
