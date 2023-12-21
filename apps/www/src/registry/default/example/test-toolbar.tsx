import React, { useEffect, useRef } from 'react';
import { isSelectionExpanded, useEditorSelector } from '@udecode/plate-common';

const useRenderCount = () => {
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
  });
  return renderCount.current;
};

export const TestToolbar = () => {
  const isExpanded = useEditorSelector(isSelectionExpanded, []);
  const renderCount = useRenderCount();

  return (
    <>
      {JSON.stringify(
        {
          renderCount, // Increments only when isExpanded changes
          isExpanded,
        },
        null,
        2
      )}
    </>
  );
};
