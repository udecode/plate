import React from 'react';

import { getPluginOptions, useEditorRef } from '@udecode/plate-common';

import {
  type BlockSelectionPlugin,
  KEY_BLOCK_SELECTION,
} from '../createBlockSelectionPlugin';

export const BlockSelection = ({ children }: any) => {
  const editor = useEditorRef();
  const { editorPaddingRight } = getPluginOptions<BlockSelectionPlugin>(
    editor,
    KEY_BLOCK_SELECTION
  );

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/*
       *select text then move cursor to the very bottom will trigger the default browser behavior
       *this div is a workaround to prevent the default browser behavior (set userSelect: none)
       *Make sure the div with is the same with the editor's padding-right
       */}

      {/* TODO: click to focus the node */}
      <div
        data-plate-selectable
        style={{
          height: '100%',
          pointerEvents: 'none',
          position: 'absolute',
          right: 0,
          top: 0,
          userSelect: 'none',
          width: editorPaddingRight ?? 'max(5%, 24px)',
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
};
