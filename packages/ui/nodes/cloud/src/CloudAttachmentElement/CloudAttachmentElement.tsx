import React from 'react';
import { AttachFile } from '@styled-icons/material/AttachFile';
import { CloudDownload } from '@styled-icons/material/CloudDownload';
import { Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { useFocused, useSelected } from 'slate-react';
import { getCloudAttachmentElementStyles } from './CloudAttachmentElement.styles';
import { CloudAttachmentElementProps } from './CloudAttachmentElement.types';

export const CloudAttachmentElement = <V extends Value>(
  props: CloudAttachmentElementProps<V>
) => {
  const { attributes, children, element, nodeProps } = props;

  const selected = useSelected();
  const focused = useFocused();
  const rootProps = getRootProps(props);
  const styles = getCloudAttachmentElementStyles({
    ...props,
    selected,
    focused,
  });

  // const FileIcon = props.styles?.fileIcon || AttachFile;

  return (
    <div
      css={styles.root.css}
      {...attributes}
      {...rootProps}
      {...nodeProps}
      contentEditable={false}
      draggable
    >
      <div css={styles.file?.css}>
        <AttachFile width={24} height={24} />
      </div>
      <div css={styles.body?.css}>{element.filename}</div>
      <a href={element.url} target="_blank" rel="noreferrer">
        <CloudDownload css={styles.download?.css} />
      </a>
      {children}
    </div>
  );
};
