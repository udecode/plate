import React, { CSSProperties, useEffect } from 'react';
import { Origin } from 'slate-portive';
import { TPortiveImageElement } from '../createPortivePlugin';
import { useHostedImageStore } from '../hostedImageStore';
import { generateSrc } from './generateSrc';
import { generateSrcSet } from './generateSrcSet';
import { ImageControls } from './ImageControls';
import { useHighlightedStyle } from './useHighlightedStyle';
import { useOrigin } from './useOrigin';

/**
 * Strategy for handling `maxSize`
 *
 * How to handle maxSize.
 *
 * When an image is first uploaded, the size is taken from the `Image` object.
 *
 * This size can be persisted to the `Element` but then it has to be saved
 * which is unnecessary since it can be derived from the `url`.
 *
 * Saving it as a separate prop also has problems in that the maxSize could be
 * changed and puts the `Element` in an inconsistent state. But this invalid
 * state would be unlikely and we could also fix it with a normalizer to be
 * safe.
 *
 * Another method is to to add `maxSize` to `useHostedImage` as part of the
 * `HostImageContext`. In this scenario, we either get the `maxSize` from the
 * `url` if it is valid, or we get it from the `Origin` if it is not.
 *
 * We could prefer the `maxSize` from the `url` and if that fails, then we
 * fall back to the `Origin`.
 *
 * # Saving
 *
 * We should also make saving through a method like `editor.getHostedChildren()`
 * which returns `Promise`.
 */

export function HostedImage({
  element,
  className,
  style,
  ...imageProps
}: {
  element: TPortiveImageElement;
  className?: string;
  style?: CSSProperties;
} & React.HTMLAttributes<HTMLImageElement>) {
  const setSize = useHostedImageStore().set.size();
  const setOrigin = useHostedImageStore().set.origin();

  const origin = useOrigin(element.originKey);
  const { size } = element;

  useEffect(() => {
    setOrigin(origin as Origin);
  }, [origin, setOrigin]);

  useEffect(() => {
    setSize(size || null);
  }, [setSize, size]);

  const highlightedStyle = useHighlightedStyle();

  const src = generateSrc({
    originUrl: origin?.url,
    size,
    maxSize: element.originSize,
  });

  const srcSet = generateSrcSet({
    originUrl: origin?.url,
    size,
    maxSize: element.originSize,
  });

  return (
    <ImageControls element={element}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        src={src ?? element.url}
        srcSet={srcSet || undefined}
        width={size ? size[0] : undefined}
        height={size ? size[1] : undefined}
        className={className}
        style={{ ...highlightedStyle, ...style, display: 'block' }}
        {...imageProps}
      />
    </ImageControls>
  );
}
