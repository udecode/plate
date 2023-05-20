import React, { useEffect, useState } from 'react';
import { TCloudImageElement, useUpload } from '@udecode/plate-cloud';
import { findNodePath, setNodes, Value } from '@udecode/plate-common';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { useFocused, useSelected } from 'slate-react';
import { generateSrcAndSrcSet } from './generateSrcAndSrcSet';
import { ResizeControls } from './ResizeControls';
import { StatusBar } from './StatusBar';

export interface CloudImageElementProps
  extends PlateElementProps<Value, TCloudImageElement> {}

export function CloudImageElement({
  className,
  ...props
}: CloudImageElementProps) {
  const { children, editor, element } = props;

  const upload = useUpload(element.url);

  const url = upload.status !== 'not-found' ? upload.url : undefined;

  useEffect(() => {
    /**
     * We only want to update the actual URL of the element if the URL is not
     * a blob URL and if it's different from the current URL.
     *
     * NOTE:
     *
     * If the user does an undo, this may cause some issues. The ideal solution
     * is to change the URL once the upload is complete to the final URL and
     * change the edit history so that the initial insertion of the cloud image
     * appears to have the final URL.
     */
    if (
      typeof url === 'string' &&
      !url.startsWith('blob:') &&
      url !== element.url
    ) {
      const path = findNodePath(editor, element);
      setNodes<TCloudImageElement>(
        editor,
        { url },
        {
          at: path,
        }
      );
    }
  }, [editor, element, url]);

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: element.width,
    height: element.height,
  });

  useEffect(() => {
    setSize({ width: element.width, height: element.height });
  }, [element.width, element.height]);

  const selected = useSelected();
  const focused = useFocused();

  const { src, srcSet } = generateSrcAndSrcSet({
    url: upload.status !== 'not-found' ? upload.url : undefined,
    size: [element.width, element.height],
    maxSize: [element.maxWidth, element.maxHeight],
  });

  return (
    <PlateElement
      className={cn('relative my-4', className)}
      draggable
      {...props}
    >
      <span
        contentEditable={false}
        style={{
          /**
           * NOTE:
           * This code pretty much needs to be this way or things stop working
           * so this cannot be overrided in the `.styles.ts` file.
           */
          position: 'relative',
          display: 'inline-block',
          /**
           * This is required so that we don't get an extra gap at the bottom.
           * When display is 'inline-block' we get some extra space at the bottom
           * for the descenders because the content is expected to co-exist with text.
           *
           * Setting vertical-align to top, bottom or middle fixes this because it is
           * no longer baseline which causes the issue.
           *
           * This is usually an issue with 'img' but also affects this scenario.
           *
           * https://stackoverflow.com/questions/5804256/image-inside-div-has-extra-space-below-the-image
           *
           * Also, make sure that <img> on the inside is display: 'block'.
           */
          verticalAlign: 'top',
          /**
           * Disable user select. We use our own selection display.
           */
          userSelect: 'none',
        }}
      >
        {src !== '' ? (
          <img
            className={cn(
              'block rounded-lg',
              focused && selected && 'shadow-[0_0_1px_3px_#60a5fa]'
            )}
            src={src}
            srcSet={srcSet}
            width={size.width}
            height={size.height}
            alt=""
          />
        ) : (
          <div
            className={cn(
              'block rounded-lg',
              focused && selected && 'shadow-[0_0_1px_3px_#60a5fa]'
            )}
            style={{
              width: size.width,
              height: size.height,
              background: '#e0e0e0',
            }}
          />
        )}
        <div className="absolute inset-x-2 top-[50%] -mt-2">
          <StatusBar upload={upload} />
        </div>
        {selected && focused && (
          <ResizeControls element={element} size={size} setSize={setSize} />
        )}
      </span>
      {children}
    </PlateElement>
  );
}
