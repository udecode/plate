import { ComponentProps, useCallback } from 'react';
import { ContentCopy } from '@styled-icons/material';
import { createElementAs } from '@udecode/plate-core';

export type ThreadLinkDialogCopyIconProps = {
  threadLink?: string;
} & ComponentProps<typeof ContentCopy>;

export const useThreadLinkDialogCopyIcon = (
  props: ThreadLinkDialogCopyIconProps
) => {
  const { threadLink } = props;

  const copyLinkToClipboard = useCallback(() => {
    if (threadLink) navigator.clipboard.writeText(threadLink);
  }, [threadLink]);

  return {
    ...props,
    onClick: copyLinkToClipboard,
  };
};

export const ThreadLinkDialogCopyIcon = (
  props: ThreadLinkDialogCopyIconProps
) => {
  const htmlProps = useThreadLinkDialogCopyIcon(props);
  return createElementAs(ContentCopy, htmlProps);
};
