import React from 'react';
import { InjectComponentReturnType } from '@udecode/plate-common';

import { useToggleControllerStore, useToggleIndex } from './store';

export const injectToggle = (): InjectComponentReturnType => WithToggle;

const WithToggle: InjectComponentReturnType = ({ element, children }) => {
  // Instead of using both the toggle index and the open ids atoms,
  //    use a single atom that is subscribed to the sole value relevant for this element: isOpen
  const [openIds] = useToggleControllerStore().use.openIds();
  const toggleIndex = useToggleIndex();
  const enclosedInToggleIds = toggleIndex.get(element.id as string) || [];
  const isOpen = enclosedInToggleIds.every((id) => openIds.has(id));

  if (isOpen) return children;

  return (
    <div
      style={{
        visibility: 'hidden',
        height: 0,
        margin: 0,
      }}
    >
      {children}
    </div>
  );
};
