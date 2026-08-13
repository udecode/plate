'use client';

import * as React from 'react';
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import ReactPlayer from 'react-player';

import type { PlateElementProps } from 'platejs/react';

import { useDraggable } from '@platejs/dnd';
import { parseTwitterUrl, parseVideoUrl } from '@platejs/media';
import { useMediaState, VideoPlugin } from '@platejs/media/react';
import { PlateElement, useEditor, useEditorMounted } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
  withResizableProvider,
} from './resize-handle';

export const VideoElement = withResizableProvider(function VideoElement(
  props: PlateElementProps<typeof VideoPlugin>
) {
  const {
    embed,
    isVideo,
    isUpload,
    isYoutube,
    selected,
    textAlign = 'center',
    unsafeUrl,
  } = useMediaState(VideoPlugin, {
    urlParsers: [parseTwitterUrl, parseVideoUrl],
  });
  const captionFocused = useCaptionFocused(props.path);
  const editor = useEditor();
  const isEditorMounted = useEditorMounted();
  const shouldRenderEmbedPlayer =
    isEditorMounted && !isUpload && !isYoutube && isVideo;
  const shouldRenderFileVideo = isEditorMounted && (isUpload || !isVideo);

  const isTweet = true;

  const { isDragging, handleRef } = useDraggable({
    element: props.element,
  });

  return (
    <PlateElement className="py-2.5" {...props}>
      <figure className="relative m-0 cursor-default">
        <div contentEditable={false}>
          <Resizable
            className={cn(isDragging && 'opacity-50')}
            align={textAlign}
            options={{
              align: textAlign,
              maxWidth: isTweet ? 550 : '100%',
              minWidth: isTweet ? 300 : 100,
              onResizeEnd: (width) =>
                editor
                  .plugin(VideoPlugin)
                  .update.set({ width }, { at: props.path }),
              width: props.element.width,
            }}
          >
            <div className="group/media">
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                options={{ direction: 'left' }}
              />

              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'right' })}
                options={{ direction: 'right' }}
              />

              {!isUpload && isYoutube && (
                <div ref={handleRef}>
                  <LiteYouTubeEmbed
                    id={embed!.id!}
                    title="youtube"
                    wrapperClass={cn(
                      'aspect-video rounded-sm',
                      'relative block cursor-pointer bg-black bg-center bg-cover [contain:content]',
                      '[&.lyt-activated]:before:absolute [&.lyt-activated]:before:top-0 [&.lyt-activated]:before:h-[60px] [&.lyt-activated]:before:w-full [&.lyt-activated]:before:bg-top [&.lyt-activated]:before:bg-repeat-x [&.lyt-activated]:before:pb-[50px] [&.lyt-activated]:before:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                      '[&.lyt-activated]:before:bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)]',
                      'after:block after:pb-[var(--aspect-ratio)] after:content-[""]',
                      '[&_>_iframe]:absolute [&_>_iframe]:top-0 [&_>_iframe]:left-0 [&_>_iframe]:size-full',
                      '[&_>_.lty-playbtn]:z-1 [&_>_.lty-playbtn]:h-[46px] [&_>_.lty-playbtn]:w-[70px] [&_>_.lty-playbtn]:rounded-[14%] [&_>_.lty-playbtn]:bg-[#212121] [&_>_.lty-playbtn]:opacity-80 [&_>_.lty-playbtn]:[transition:all_0.2s_cubic-bezier(0,_0,_0.2,_1)]',
                      '[&:hover_>_.lty-playbtn]:bg-[red] [&:hover_>_.lty-playbtn]:opacity-100',
                      '[&_>_.lty-playbtn]:before:border-[transparent_transparent_transparent_#fff] [&_>_.lty-playbtn]:before:border-y-[11px] [&_>_.lty-playbtn]:before:border-r-0 [&_>_.lty-playbtn]:before:border-l-[19px] [&_>_.lty-playbtn]:before:content-[""]',
                      '[&_>_.lty-playbtn]:absolute [&_>_.lty-playbtn]:top-1/2 [&_>_.lty-playbtn]:left-1/2 [&_>_.lty-playbtn]:[transform:translate3d(-50%,-50%,0)]',
                      '[&_>_.lty-playbtn]:before:absolute [&_>_.lty-playbtn]:before:top-1/2 [&_>_.lty-playbtn]:before:left-1/2 [&_>_.lty-playbtn]:before:[transform:translate3d(-50%,-50%,0)]',
                      '[&.lyt-activated]:cursor-[unset]',
                      '[&.lyt-activated]:before:pointer-events-none [&.lyt-activated]:before:opacity-0',
                      '[&.lyt-activated_>_.lty-playbtn]:pointer-events-none [&.lyt-activated_>_.lty-playbtn]:opacity-0!'
                    )}
                  />
                </div>
              )}

              {shouldRenderFileVideo && (
                <div ref={handleRef}>
                  <video
                    className="w-full max-w-full rounded-sm object-cover px-0"
                    src={unsafeUrl}
                    controls
                  />
                </div>
              )}

              {shouldRenderEmbedPlayer && (
                <div ref={handleRef}>
                  <ReactPlayer
                    height="100%"
                    src={unsafeUrl}
                    width="100%"
                    controls
                  />
                </div>
              )}
            </div>
          </Resizable>
        </div>
        <Caption
          active={selected || captionFocused}
          align={textAlign}
          element={props.element}
          slots={props.slots}
        >
          {props.children}
        </Caption>
      </figure>
    </PlateElement>
  );
});
