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
    <div
      css={styles.root.css}
      {...attributes}
      {...rootProps}
      {...nodeProps}
      contentEditable={false}
      draggable
    >
      <img
        src={element.url}
        width={element.width}
        height={element.height}
        alt=""
      />
      {/* <div css={styles.file?.css}>
        <AttachFile width={24} height={24} />
      </div>
      <div css={styles.body?.css}>
        <div css={styles.filename?.css}>{element.filename}</div>
        <StatusBar upload={upload}>
          <div css={styles.caption?.css}>{element.bytes} bytes</div>
        </StatusBar>
      </div>
      <div css={styles.download?.css}>
        {upload.status === 'success' && (
          <a href={element.url} target="_blank" rel="noreferrer">
            <CloudDownload css={styles.downloadIcon?.css} />
          </a>
        )}
      </div> */}
      {children}
    </div>
  );
};
