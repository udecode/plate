import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Check } from '@styled-icons/material/Check';
import { Thread } from '@xolvio/plate-comments';
import { OnResolveThread } from '../../types';
import {
  createResolveButtonStyles,
  ResolveButtonStyledProps,
} from './ResolveButton.styles';

export function ResolveButton(
  props: {
    thread: Thread;
    onResolveThread: OnResolveThread;
  } & ResolveButtonStyledProps
) {
  const { thread, onResolveThread } = props;

  const { root, icon } = createResolveButtonStyles(props);

  const title = `Mark as ${
    thread.assignedTo ? 'done' : 'resolved'
  } and hide discussion`;

  return (
    <button
      type="button"
      css={root.css}
      className={`${root.className} mdc-icon-button`}
      onClick={onResolveThread}
      title={title}
    >
      <div className="mdc-icon-button__ripple" />
      <Check css={icon!.css} className={icon!.className} />
    </button>
  );
}
