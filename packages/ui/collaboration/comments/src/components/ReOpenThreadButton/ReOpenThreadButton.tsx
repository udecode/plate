import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Unarchive } from '@styled-icons/material/Unarchive';
import { OnReOpenThread } from '../../types';
import {
  createReOpenThreadButtonStyles,
  ReOpenThreadButtonStyledProps,
} from './ReOpenThreadButton.styles';

type ReOpenThreadButtonProps = {
  onReOpenThread: OnReOpenThread;
} & ReOpenThreadButtonStyledProps;

export const ReOpenThreadButton = (props: ReOpenThreadButtonProps) => {
  const { onReOpenThread } = props;

  const { root, icon } = createReOpenThreadButtonStyles(props);

  return (
    <button
      type="button"
      css={root.css}
      className={`${root.className} mdc-icon-button`}
      onClick={onReOpenThread}
      title="Re-open"
    >
      <div className="mdc-icon-button__ripple" />
      <Unarchive css={icon!.css} className={icon!.className} />
    </button>
  );
};
