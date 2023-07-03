import React from 'react';
import { SlateProps, createTEditor, withTReact } from '@udecode/plate-common';
import React, { ComponentClass, FunctionComponent } from 'react';
import { Slate } from 'slate-react';

/**
 * Create a React element wrapped in a Slate provider.
 * By default, it will use an empty editor.
 * TODO: allow other providers
 */
export const createElementWithSlate = (
  slateProps?: Partial<SlateProps>,
  dndWrapper?: string | FunctionComponent | ComponentClass
) => {
  const {
    editor = withTReact(createTEditor()),
    value = [],
    onChange = () => {},
    children,
    ...props
  } = slateProps || {};

  if (dndWrapper) {
    return React.createElement(
      dndWrapper,
      null,
      React.createElement(
        Slate,
        {
          editor,
          initialValue: value,
          onChange,
          ...props,
        } as any,
        children
      )
    );
  }

  return React.createElement(
    Slate,
    {
      editor,
      initialValue: value,
      onChange,
      ...props,
    } as any,
    children
  );
};
