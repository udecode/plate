import React from 'react';
import { PlateElement } from '@udecode/plate';
import { Box, PlateElementProps, Value } from '@udecode/plate-common';
import { ElementPopover, PopoverProps } from '@udecode/plate-floating';
import {
  Caption,
  CaptionTextarea,
  ELEMENT_MEDIA_EMBED,
  MediaEmbed,
  Resizable,
  TMediaEmbedElement,
  useMediaState,
  useMediaStore,
} from '@udecode/plate-media';
import { useFocused, useReadOnly, useSelected } from 'slate-react';
import {
  mediaFloatingOptions,
  MediaFloatingToolbar,
} from './media-floating-toolbar';

import { cn } from '@/lib/utils';

// REVIEWW
export interface MediaEmbedElementPropsCaption {
  disabled?: boolean;

  /**
   * Caption placeholder.
   */
  placeholder?: string;

  /**
   * Whether caption is read-only.
   */
  readOnly?: boolean;
}

export interface MediaEmbedElementProps
  extends PlateElementProps<Value, TMediaEmbedElement> {
  caption?: MediaEmbedElementPropsCaption;
  popoverProps?: PopoverProps;
}

const MediaEmbedElement = React.forwardRef<
  React.ElementRef<typeof ElementPopover>,
  MediaEmbedElementProps
>(({ className, ...props }, ref) => {
  const { children, nodeProps, caption = {}, popoverProps = {} } = props;

  const focused = useFocused();
  const selected = useSelected();
  const readOnly = useReadOnly();

  const { provider } = useMediaStore().get.urlData();

  useMediaState();

  return (
    <ElementPopover
      ref={ref}
      content={<MediaFloatingToolbar pluginKey={ELEMENT_MEDIA_EMBED} />}
      floatingOptions={mediaFloatingOptions}
      {...popoverProps}
    >
      <PlateElement className={cn('relative py-2.5', className)} {...props}>
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
            maxWidth={provider === 'twitter' ? 550 : '100%'}
            minWidth={provider === 'twitter' ? 300 : 100}
            renderHandleLeft={(htmlProps) => (
              <Box
                {...htmlProps}
                className={cn(
                  'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                  'after:flex after:h-16 after:bg-gray-400  after:opacity-0 after:group-hover:opacity-100',
                  "after:w-[3px] after:rounded-[6px] after:content-['_']",
                  'hover:after:bg-blue-500 focus:after:bg-blue-500 active:after:bg-blue-500',
                  focused && selected && 'opacity-100',
                  // variant left
                  '-left-3 -ml-3 pl-3'
                )}
              />
            )}
            renderHandleRight={(htmlProps) => (
              <Box
                {...htmlProps}
                className={cn(
                  'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
                  'after:flex after:h-16 after:bg-gray-400  after:opacity-0 after:group-hover:opacity-100',
                  "after:w-[3px] after:rounded-[6px] after:content-['_']",
                  'hover:after:bg-blue-500 focus:after:bg-blue-500 active:after:bg-blue-500',
                  focused && selected && 'opacity-100',
                  // variant right
                  '-right-3 -mr-3 items-end pr-3',
                  provider === 'twitter' && '-mr-4'
                )}
              />
            )}
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
              <MediaEmbed
                className={cn(
                  'absolute left-0 top-0 h-full w-full',
                  'rounded-[3px] shadow-[0_0_1px_rgb(59,130,249)]'
                )}
                {...nodeProps}
              />
            </div>
          </Resizable>

          {!caption.disabled && (
            <Caption className={cn('mx-auto')}>
              <CaptionTextarea
                className={cn(
                  'mt-2 w-full resize-none border-none bg-inherit p-0 font-[inherit] text-inherit',
                  'focus:outline-none focus:[&::placeholder]:opacity-0',
                  'text-center'
                )}
                placeholder={caption.placeholder ?? 'Write a caption...'}
              />
            </Caption>
          )}
        </figure>

        {children}
      </PlateElement>
    </ElementPopover>
  );
});
MediaEmbedElement.displayName = 'MediaEmbedElement';

export { MediaEmbedElement };
