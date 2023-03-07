import React, { useEffect, useState } from 'react';
import { useUpload } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-common';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { StatusBar } from '../StatusBar';
import { getCloudImageElementStyles } from './CloudImageElement.styles';
import { CloudImageElementProps } from './CloudImageElement.types';
import { generateSrcAndSrcSet } from './generateSrcAndSrcSet';
import { ResizeControls } from './ResizeControls';

export const CloudImageElement = <V extends Value>(
  props: CloudImageElementProps<V>
) => {
  const { attributes, children, element, nodeProps } = props;

  const upload = useUpload(element.url);

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: element.width,
    height: element.height,
  });

  useEffect(() => {
    setSize({ width: element.width, height: element.height });
  }, [element.width, element.height]);

  const selected = useSelected();
  const focused = useFocused();
  const rootProps = getRootProps(props);
  const styles = getCloudImageElementStyles({
    ...props,
    selected,
    focused,
  });

  const { src, srcSet } = generateSrcAndSrcSet({
    url: upload.status !== 'not-found' ? upload.url : undefined,
    size: [element.width, element.height],
    maxSize: [element.maxWidth, element.maxHeight],
  });

  return (
    <div
      css={styles.root.css}
      {...attributes}
      {...rootProps}
      {...nodeProps}
      draggable
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
        <img
          css={styles.img?.css}
          src={src}
          srcSet={srcSet}
          width={size.width}
          height={size.height}
          alt=""
        />
        <div css={styles.statusBarContainer?.css}>
          <StatusBar
            upload={upload}
            progressBarTrackCss={styles.progressBarTrack?.css}
            progressBarBarCss={styles.progressBarBar?.css}
            failBarCss={styles.failBar?.css}
          />
        </div>
        {selected && focused && (
          <ResizeControls element={element} size={size} setSize={setSize} />
        )}
      </span>
      {children}
    </div>
  );
};
