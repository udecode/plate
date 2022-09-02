import React from 'react';
import {
  Thread,
  ThreadElement as TThreadElement,
} from '@udecode/plate-comments';
import { Value } from '@udecode/plate-core';
import {
  getRootProps,
  StyledElementProps,
} from '@udecode/plate-styled-components';
import { createThreadElementStyles } from './ThreadElement.styles';

const determineStyle = (
  element: any,
  thread: Thread,
  props: StyledElementProps<Value, TThreadElement>
) => {
  let style;
  const { root, selected, resolved } = createThreadElementStyles(props);
  if (thread.isResolved) {
    style = resolved;
  } else if (element.selected) {
    style = selected;
  } else {
    style = root;
  }
  return style;
};

export const ThreadElement = (
  props: StyledElementProps<Value, TThreadElement>
) => {
  const { attributes, children, nodeProps, element } = props;
  const { thread } = element;

  const rootProps = getRootProps(props);
  const style = determineStyle(element, thread, props);

  return (
    <span
      {...attributes}
      css={style?.css}
      className={style?.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </span>
  );
};
