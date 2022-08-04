import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Unarchive } from '@styled-icons/material/Unarchive';
import { OnReOpenThread } from '../../types';
import {
  createReOpenThreadButtonStyles,
  ReOpenThreadButtonStyledProps,
} from './ReOpenThreadButton.styles';

export function ReOpenThreadButton(
  props: {
    onReOpenThread: OnReOpenThread;
  } & ReOpenThreadButtonStyledProps
) {
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
}
