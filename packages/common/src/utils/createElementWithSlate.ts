import * as React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { SlateProps } from '../types/Slate.types';

/**
 * Create a React element wrapped in a Slate provider.
 * By default, it will use an empty editor.
 * TODO: allow other providers
 */
export const createElementWithSlate = (slateProps?: Partial<SlateProps>) => {
  const {
    editor = withReact(createEditor()),
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
