import React from 'react';
import { InjectComponent } from '@udecode/plate-core';
import { useBlockSelectionSelectors } from './blockSelectionStore';

export const injectBlockSelectionComponent: InjectComponent = () => ({
  children,
  element,
}) => {
  const id = element.id as string | undefined;
  const isSelected = useBlockSelectionSelectors().isSelected(id);

  return (
    <div
      style={{
        backgroundColor: isSelected ? 'rgb(219 234 254)' : undefined,
      }}
      className={
        isSelected ? 'slate-selected slate-selectable' : 'slate-selectable'
      }
      data-key={id}
      key={id}
    >
      {children}
    </div>
  );
};
