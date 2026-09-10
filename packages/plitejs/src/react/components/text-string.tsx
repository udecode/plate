import React from 'react';

import type { PliteDecorationAttributes } from '../decoration-source';

export const DecoratedTextString = ({
  attributes,
  isTrailing = false,
  text,
}: {
  attributes: PliteDecorationAttributes;
  isTrailing?: boolean;
  text: string;
}) => (
  <span
    {...attributes}
    data-plite-length={isTrailing ? text.length : undefined}
    data-plite-string
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
    data-plite-length={isTrailing ? text.length : undefined}
    data-plite-string
  >
    {`${text ?? ''}${isTrailing ? '\n' : ''}`}
  </span>
);
