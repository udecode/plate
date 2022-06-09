import React from 'react';
import { Slate } from 'slate-react';
import { SlateProps } from '../../../slate/types/SlateProps';
import { createTEditor } from '../../../utils/createTEditor';
import { withTReact } from '../../withTReact';

/**
 * Create a React element wrapped in a Slate provider.
 * By default, it will use an empty editor.
 * TODO: allow other providers
 */
export const createElementWithSlate = (slateProps?: Partial<SlateProps>) => {
  const {
    editor = withTReact(createTEditor()),
    value = [],
    onChange = () => {},
    children,
    ...props
  } = slateProps || {};

  return React.createElement(
    Slate,
    {
      editor,
      value,
      onChange,
      ...props,
    } as any,
    children
  );
};
