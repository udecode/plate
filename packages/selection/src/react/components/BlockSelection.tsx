import React from 'react';

import { useEditorPlugin } from '@udecode/plate-common/react';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const BlockSelection = ({ children }: any) => {
  const { getOptions } = useEditorPlugin(BlockSelectionPlugin);

  const { editorPaddingRight, rightSelectionAreaClassName } = getOptions();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/*
       *select text then move cursor to the very bottom will trigger the default browser behavior
       *this div is a workaround to prevent the default browser behavior (set userSelect: none)
       *Make sure the div with is the same with the editor's padding-right
       */}

      {/* TODO: click to focus the node */}
      <div
        className={rightSelectionAreaClassName}
        style={{
          height: '100%',
          position: 'absolute',
          right: 0,
          top: 0,
          userSelect: 'none',
          width: editorPaddingRight ?? 'max(5%, 24px)',
          zIndex: 1,
        }}
        data-plate-selectable
      />
      {children}
    </div>
  );
};
