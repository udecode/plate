import React from 'react';
import { RenderElementProps } from 'slate-react';
import { ActionItemElement } from './components/ActionItemElement';
import { ACTION_ITEM } from './types';

export const renderElementActionItem = () => (props: RenderElementProps) => {
  if (props.element.type === ACTION_ITEM) {
    return <ActionItemElement {...props} />;
  }
};
