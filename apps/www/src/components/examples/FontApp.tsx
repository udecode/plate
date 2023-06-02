import React, { CSSProperties } from 'react';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { FixedToolbar } from '@/plate/aui/fixed-toolbar';
import { ColorDropdownMenu } from '@/plate/bcomponents/font/ColorDropdownMenu';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { fontValue } from '@/plate/demo/values/fontValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const styles: Record<string, CSSProperties> = {
  copyWrapper: {
    borderBottom: '1px solid #eee',
    margin: '0 -16px',
    padding: '0 16px 16px',
  },
  copy: {
    color: '#f92672',
  },
};

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createFontColorPlugin(),
    createFontBackgroundColorPlugin(),
    createFontSizePlugin(),
  ],
  {
    components: plateUI,
  }
);

function CopyContent() {
  return (
    <div style={styles.copyWrapper}>
      <span style={styles.copy}>Copy Me in the editor</span>
    </div>
  );
}

export default function FontApp() {
  return (
    <PlateProvider<MyValue> initialValue={fontValue} plugins={plugins}>
      <FixedToolbar>
        <ColorDropdownMenu pluginKey={MARK_COLOR} tooltip="Text color">
          <Icons.color />
        </ColorDropdownMenu>
        <ColorDropdownMenu pluginKey={MARK_BG_COLOR} tooltip="Highlight color">
          <Icons.bg />
        </ColorDropdownMenu>
      </FixedToolbar>

      <CopyContent />

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
