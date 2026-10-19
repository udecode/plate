import React from 'react';

export const ZeroWidthString = ({
  length = 0,
  isLineBreak = false,
  isMarkPlaceholder = false,
  includeSentinel = !isLineBreak,
}: {
  length?: number;
  isLineBreak?: boolean;
  isMarkPlaceholder?: boolean;
  includeSentinel?: boolean;
}) => {
  const attributes: {
    'data-editor-zero-width': string;
    'data-editor-length': number;
    'data-editor-mark-placeholder'?: boolean;
  } = {
    'data-editor-zero-width': isLineBreak ? 'n' : 'z',
    'data-editor-length': length,
  };

  if (isMarkPlaceholder) {
    attributes['data-editor-mark-placeholder'] = true;
  }

  if (isLineBreak) {
    if (includeSentinel) {
      return (
        <span {...attributes}>
          {'\uFEFF'}
          <br />
        </span>
      );
    }

    return (
      // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] This fixed editor marker renders a trusted literal break, not external HTML. Chromium rewrites this <br> during IME composition, so React must not own it as a child fiber; owning it crashed reconciliation with a removeChild NotFoundError.
      <span {...attributes} dangerouslySetInnerHTML={{ __html: '<br />' }} />
    );
  }

  return <span {...attributes}>{'\uFEFF'}</span>;
};
