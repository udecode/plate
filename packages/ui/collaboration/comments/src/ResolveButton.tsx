import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Check } from '@styled-icons/material/Check';
import { OnResolveThread } from './OnResolveThread';
import {
  createResolveButtonStyles,
  ResolveButtonStyledProps,
} from './ResolveButton.styles';

export function ResolveButton(
  props: {
    onResolveThread: OnResolveThread;
  } & ResolveButtonStyledProps
) {
  const { onResolveThread } = props;

  const { root, icon } = createResolveButtonStyles(props);

  // TODO: Title text (different one for regular topic and topic that is assigned (see Google Docs)
  return (
    <button
      type="button"
      css={root.css}
      className={`${root.className} mdc-icon-button`}
      onClick={onResolveThread}
    >
      <div className="mdc-icon-button__ripple" />
      <Check css={icon!.css} className={icon!.className} />
    </button>
  );
}
