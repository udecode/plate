import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps } from 'slate-react';
import { CheckListItemElement } from './components/CheckListItemElement';

export const renderElementCheckList = () => (props: RenderElementProps) => {
  if (props.element.type === ElementType.CHECK_LIST_ITEM) {
    return <CheckListItemElement {...props} />;
  }
};
