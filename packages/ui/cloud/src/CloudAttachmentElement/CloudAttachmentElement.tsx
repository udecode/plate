import React, { useEffect } from 'react';
import { useUpload } from '@udecode/plate-cloud';
import { findNodePath, setNodes, Value } from '@udecode/plate-common';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { StatusBar } from '../StatusBar';
import { AttachFileIcon } from './AttachFileIcon';
import { getCloudAttachmentElementStyles } from './CloudAttachmentElement.styles';
import { CloudAttachmentElementProps } from './CloudAttachmentElement.types';
import { CloudDownloadIcon } from './CloudDownloadIcon';

export const CloudAttachmentElement = <V extends Value>(
  props: CloudAttachmentElementProps<V>
) => {
  const { attributes, children, editor, element, nodeProps } = props;

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

  const selected = useSelected();
  const focused = useFocused();
  const rootProps = getRootProps(props);
  const styles = getCloudAttachmentElementStyles({
    ...props,
    selected,
    focused,
  });

  return (
    <div
      css={styles.root.css}
      {...attributes}
      {...rootProps}
      {...nodeProps}
      draggable
    >
      <div css={styles.attachmentContainer?.css} contentEditable={false}>
        <AttachFileIcon
          css={styles.attachmentIcon?.css}
          width={24}
          height={24}
        />
      </div>
      <div css={styles.bodyContainer?.css} contentEditable={false}>
        <div css={styles.bodyFilename?.css}>{element.filename}</div>
        <StatusBar
          upload={upload}
          progressBarTrackCss={styles.progressBarTrack?.css}
          progressBarBarCss={styles.progressBarBar?.css}
          failBarCss={styles.failBar?.css}
        >
          <div css={styles.bodyCaption?.css}>{element.bytes} bytes</div>
        </StatusBar>
      </div>
      <div css={styles.downloadContainer?.css} contentEditable={false}>
        {upload.status === 'success' && (
          <a href={element.url} target="_blank" rel="noreferrer">
            <CloudDownloadIcon
              css={styles.downloadIcon?.css}
              width={24}
              height={24}
            />
          </a>
        )}
      </div>
      {children}
    </div>
  );
};
