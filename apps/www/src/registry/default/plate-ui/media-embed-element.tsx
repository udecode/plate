import React from 'react';
import {
  Box,
  PlateElement,
  PlateElementProps,
  Value,
} from '@udecode/plate-common';
import {
  Caption,
  CaptionTextarea,
  ELEMENT_MEDIA_EMBED,
  parseTwitterUrl,
  parseVideoUrl,
  Resizable,
  TMediaEmbedElement,
  useMediaState,
  VIDEO_PROVIDERS,
} from '@udecode/plate-media';
import { cva } from 'class-variance-authority';
import { Tweet } from 'react-tweet';

import { cn } from '@/lib/utils';

import { MediaPopover } from './media-popover';

const iframeVariants = cva(
  cn('absolute left-0 top-0 h-full w-full rounded-sm'),
  {
    variants: {
      selected: {
        true: 'ring-2 ring-ring ring-offset-2',
        false: '',
      },
      provider: {
        video: 'border-0',
      },
    },
  }
);

const MediaEmbedElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TMediaEmbedElement>
>(({ className, children, ...props }, ref) => {
  const { focused, readOnly, selected, embed } = useMediaState({
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });

  const provider = embed?.provider;

  const isTweet = embed?.provider === 'twitter';
  const isVideo = !!embed?.provider && VIDEO_PROVIDERS.includes(embed.provider);

  return (
    <MediaPopover pluginKey={ELEMENT_MEDIA_EMBED}>
      <PlateElement
        ref={ref}
        className={cn('relative py-2.5', className)}
        {...props}
      >
        <figure className="group relative m-0 w-full" contentEditable={false}>
          <Resizable
            className={cn('mx-auto')}
            options={{
              maxWidth: isTweet ? 550 : '100%',
              minWidth: isTweet ? 300 : 100,
              renderHandleLeft: (htmlProps) => (
                <Box
                  {...htmlProps}
                  className={cn(
                    'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                    'after:flex after:h-16 after:bg-ring after:opacity-0 group-hover:after:opacity-100',
                    "after:w-[3px] after:rounded-[6px] after:content-['_']",
                    focused && selected && 'opacity-100',
                    // variant left
                    '-left-3 -ml-3 pl-3'
                  )}
                />
              ),
              renderHandleRight: (htmlProps) => (
                <Box
                  {...htmlProps}
                  className={cn(
                    'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                    'after:flex after:h-16 after:bg-ring  after:opacity-0 group-hover:after:opacity-100',
                    "after:w-[3px] after:rounded-[6px] after:content-['_']",
                    focused && selected && 'opacity-100',
                    // variant right
                    '-right-3 -mr-3 items-end pr-3'
                  )}
                />
              ),
            }}
          >
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
                  src={embed.url}
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
                <Tweet id={embed.id!} />
              </div>
            )}
          </Resizable>

          <Caption className={cn('mx-auto')}>
            <CaptionTextarea
              className={cn(
                'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
                'focus:outline-none focus:[&::placeholder]:opacity-0',
                'text-center'
              )}
              placeholder="Write a caption..."
            />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    </MediaPopover>
  );
});
MediaEmbedElement.displayName = 'MediaEmbedElement';

export { MediaEmbedElement };
