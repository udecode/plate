import React from 'react';
import { AttachFile } from '@styled-icons/material/AttachFile';
import { CloudDownload } from '@styled-icons/material/CloudDownload';
import { useUpload } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { StatusBar } from '../StatusBar';
import { getCloudImageElementStyles } from './CloudImageElement.styles';
import { CloudImageElementProps } from './CloudImageElement.types';

export const CloudImageElement = <V extends Value>(
  props: CloudImageElementProps<V>
) => {
  const { attributes, children, element, nodeProps } = props;

  const upload = useUpload(element.url);
  const selected = useSelected();
  const focused = useFocused();
  const rootProps = getRootProps(props);
  const styles = getCloudImageElementStyles({
    ...props,
    selected,
    focused,
  });

  console.log({ element, upload });

  return (
    <>
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
            src={upload.status !== 'not-found' ? upload.url : ''}
            width={element.width}
            height={element.height}
            alt=""
          />
          <div css={styles.statusBarContainer?.css}>
            <StatusBar upload={upload} />
          </div>
        </span>
        {children}
      </div>
    </>
  );
};
