import React from 'react';

import type { DecorationAttributes } from '../decoration-source';

export const DecoratedTextString = ({
  attributes,
  isTrailing = false,
  text,
}: {
  attributes: DecorationAttributes;
  isTrailing?: boolean;
  text: string;
}) => (
  <span
    {...attributes}
    data-editor-length={isTrailing ? text.length : undefined}
    data-editor-string
  >
    {`${text ?? ''}${isTrailing ? '\n' : ''}`}
  </span>
);

export const TextString = ({
  text,
  isTrailing = false,
}: {
  text: string;
  isTrailing?: boolean;
}) => (
  <span
    data-editor-length={isTrailing ? text.length : undefined}
    data-editor-string
  >
    {`${text ?? ''}${isTrailing ? '\n' : ''}`}
  </span>
);
