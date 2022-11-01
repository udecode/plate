import React from 'react';
import { AttachFile } from '@styled-icons/material/AttachFile';
import { CloudDownload } from '@styled-icons/material/CloudDownload';
import { useUpload } from '@udecode/plate-cloud';
import { Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { StatusBar } from '../StatusBar';
import { getCloudAttachmentElementStyles } from './CloudAttachmentElement.styles';
import { CloudAttachmentElementProps } from './CloudAttachmentElement.types';

export const CloudAttachmentElement = <V extends Value>(
  props: CloudAttachmentElementProps<V>
) => {
  const { attributes, children, element, nodeProps } = props;

  const upload = useUpload(element.url);
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
        <AttachFile css={styles.attachmentIcon?.css} width={24} height={24} />
      </div>
      <div css={styles.bodyContainer?.css} contentEditable={false}>
        <div css={styles.bodyFilename?.css}>{element.filename}</div>
        <StatusBar upload={upload}>
          <div css={styles.bodyCaption?.css}>{element.bytes} bytes</div>
        </StatusBar>
      </div>
      <div css={styles.downloadContainer?.css} contentEditable={false}>
        {upload.status === 'success' && (
          <a href={element.url} target="_blank" rel="noreferrer">
            <CloudDownload css={styles.downloadIcon?.css} />
          </a>
        )}
      </div>
      {children}
    </div>
  );
};
