import React, { type Ref } from 'react';

import type { DecorationAttributes } from '../decoration-source';

export const DecoratedTextString = ({
  attributes,
  isTrailing = false,
  ref,
  text,
}: {
  attributes: DecorationAttributes;
  isTrailing?: boolean;
  ref?: Ref<HTMLSpanElement>;
  text: string;
}) => (
  <span
    {...attributes}
    data-editor-length={isTrailing ? text.length : undefined}
    data-editor-string
    ref={ref}
  >
    {`${text ?? ''}${isTrailing ? '\n' : ''}`}
  </span>
);

export const TextString = ({
  text,
  isTrailing = false,
  ref,
}: {
  text: string;
  isTrailing?: boolean;
  ref?: Ref<HTMLSpanElement>;
}) => (
  <span
    data-editor-length={isTrailing ? text.length : undefined}
    data-editor-string
    ref={ref}
  >
    {`${text ?? ''}${isTrailing ? '\n' : ''}`}
  </span>
);
