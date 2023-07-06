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
  Resizable,
  TMediaEmbedElement,
  useMediaEmbed,
  useMediaState,
} from '@udecode/plate-media';

import { cn } from '@/lib/utils';

import { MediaPopover } from './media-popover';

const MediaEmbedElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TMediaEmbedElement>
>(({ className, children, ...props }, ref) => {
  const { focused, provider, readOnly, selected } = useMediaState();
  const { props: mediaEmbedProps, component: MediaComponent } = useMediaEmbed();

  return (
    <MediaPopover pluginKey={ELEMENT_MEDIA_EMBED}>
      <PlateElement
        ref={ref}
        className={cn('relative py-2.5', className)}
        {...props}
      >
        <figure
          className={cn(
            'group relative m-0 w-full',
            provider === 'twitter' &&
              '[&_.twitter-tweet]: [&_.twitter-tweet]:!mx-auto [&_.twitter-tweet]:!my-0 [&_.twitter-tweet]:p-0.5',
            provider === 'twitter' &&
              !readOnly &&
              selected &&
              '[&_.twitter-tweet]:shadow-[0_0_1px_rgb(59,130,249)]'
          )}
          contentEditable={false}
        >
          <Resizable
            className={cn('mx-auto')}
            options={{
              maxWidth: provider === 'twitter' ? 550 : '100%',
              minWidth: provider === 'twitter' ? 300 : 100,
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
                    '-right-3 -mr-3 items-end pr-3',
                    provider === 'twitter' && '-mr-4'
                  )}
                />
              ),
            }}
          >
            <div
              className={cn(
                provider !== 'twitter' && 'pb-[56.0417%]',
                provider === 'youtube' && 'pb-[56.2061%]',
                provider === 'vimeo' && 'pb-[75%]',
                provider === 'youku' && 'pb-[56.25%]',
                provider === 'dailymotion' && 'pb-[56.0417%]',
                provider === 'coub' && 'pb-[51.25%]'
              )}
            >
              <MediaComponent
                className={cn(
                  'absolute left-0 top-0 h-full w-full rounded-sm',
                  selected && focused && 'ring-2 ring-ring ring-offset-2'
                )}
                title="embed"
                {...mediaEmbedProps}
              />
            </div>
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
