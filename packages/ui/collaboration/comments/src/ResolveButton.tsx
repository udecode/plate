import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Check } from '@styled-icons/material/Check';
import { Thread } from '@xolvio/plate-comments';
import { OnResolveThread } from './OnResolveThread';
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

  return (
    <button
      type="button"
      css={root.css}
      className={`${root.className} mdc-icon-button`}
      onClick={onResolveThread}
      title={
        thread.assignedTo
          ? 'Mark as done and then hide discussion'
          : 'Mark as resolved and hide discussion'
      }
    >
      <div className="mdc-icon-button__ripple" />
      <Check css={icon!.css} className={icon!.className} />
    </button>
  );
}
