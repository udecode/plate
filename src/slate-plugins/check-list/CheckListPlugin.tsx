import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps, SlatePlugin } from 'slate-react';
import { CheckListItemElement } from './CheckListItemElement';
import { withChecklist } from './withChecklist';

export const renderElementCheckList = (props: RenderElementProps) => {
  const { element } = props;

  if (element.type === ElementType.CHECK_LIST_ITEM) {
    return <CheckListItemElement {...props} />;
  }
};

export const CheckListPlugin = (): SlatePlugin => ({
  editor: withChecklist,
  renderElement: renderElementCheckList,
});
