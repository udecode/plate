import { TTodoListItemElement } from '@udecode/plate-list';
import { useReadOnly } from 'slate-react';

export const useTodoListElementState = (props: {
  element: TTodoListItemElement;
}) => {
  const { element } = props;
  const { checked } = element;

  const readOnly = useReadOnly();

  return { checked, readOnly };
};
