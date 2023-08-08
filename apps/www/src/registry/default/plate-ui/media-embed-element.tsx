import React from 'react';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import {
  ELEMENT_MEDIA_EMBED,
  parseTwitterUrl,
  parseVideoUrl,
  TMediaEmbedElement,
  useMediaState,
} from '@udecode/plate-media';
import { useResizableStore } from '@udecode/plate-resizable';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import { Tweet } from 'react-tweet';

import { cn } from '@/lib/utils';

import { Caption, CaptionTextarea } from './caption';
import { MediaPopover } from './media-popover';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resizable';

const MediaEmbedElement = React.forwardRef<
  React.ElementRef<typeof PlateElement>,
  PlateElementProps<Value, TMediaEmbedElement>
>(({ className, children, ...props }, ref) => {
  const {
    align = 'center',
    focused,
    readOnly,
    selected,
    embed,
    isTweet,
    isVideo,
    isYoutube,
  } = useMediaState({
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });
  const width = useResizableStore().get.width();
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
            <ResizeHandle
              options={{ direction: 'left' }}
              className={mediaResizeHandleVariants({ direction: 'left' })}
            />

            {isVideo ? (
              isYoutube ? (
                <LiteYouTubeEmbed
                  id={embed!.id!}
                  title="youtube"
                  wrapperClass={cn(
                    'rounded-sm',
                    focused && selected && 'ring-2 ring-ring ring-offset-2',
                    'relative block cursor-pointer bg-black bg-cover bg-center [contain:content]',
                    '[&.lyt-activated]:before:absolute [&.lyt-activated]:before:top-0 [&.lyt-activated]:before:h-[60px] [&.lyt-activated]:before:w-full [&.lyt-activated]:before:bg-top [&.lyt-activated]:before:bg-repeat-x [&.lyt-activated]:before:pb-[50px] [&.lyt-activated]:before:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                    '[&.lyt-activated]:before:bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)]',
                    'after:block after:pb-[var(--aspect-ratio)] after:content-[""]',
                    '[&_>_iframe]:absolute [&_>_iframe]:left-0 [&_>_iframe]:top-0 [&_>_iframe]:h-full [&_>_iframe]:w-full',
                    '[&_>_.lty-playbtn]:z-[1] [&_>_.lty-playbtn]:h-[46px] [&_>_.lty-playbtn]:w-[70px] [&_>_.lty-playbtn]:rounded-[14%] [&_>_.lty-playbtn]:bg-[#212121] [&_>_.lty-playbtn]:opacity-80 [&_>_.lty-playbtn]:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                    '[&:hover_>_.lty-playbtn]:bg-[red] [&:hover_>_.lty-playbtn]:opacity-100',
                    '[&_>_.lty-playbtn]:before:border-y-[11px] [&_>_.lty-playbtn]:before:border-l-[19px] [&_>_.lty-playbtn]:before:border-r-0 [&_>_.lty-playbtn]:before:border-[transparent_transparent_transparent_#fff] [&_>_.lty-playbtn]:before:content-[""]',
                    '[&_>_.lty-playbtn]:absolute [&_>_.lty-playbtn]:left-1/2 [&_>_.lty-playbtn]:top-1/2 [&_>_.lty-playbtn]:[transform:translate3d(-50%,-50%,0)]',
                    '[&_>_.lty-playbtn]:before:absolute [&_>_.lty-playbtn]:before:left-1/2 [&_>_.lty-playbtn]:before:top-1/2 [&_>_.lty-playbtn]:before:[transform:translate3d(-50%,-50%,0)]',
                    '[&.lyt-activated]:cursor-[unset]',
                    '[&.lyt-activated]:before:pointer-events-none [&.lyt-activated]:before:opacity-0',
                    '[&.lyt-activated_>_.lty-playbtn]:pointer-events-none [&.lyt-activated_>_.lty-playbtn]:!opacity-0'
                  )}
                />
              ) : (
                <div
                  className={cn(
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
              )
            ) : null}

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

            <ResizeHandle
              options={{ direction: 'right' }}
              className={mediaResizeHandleVariants({ direction: 'right' })}
            />
          </Resizable>

          <Caption align={align} style={{ width }}>
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
